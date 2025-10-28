interface SberConfig {
  clientId: string;
  clientSecret: string;
  scope: string;
}

interface SberTokenResponse {
  access_token: string;
  expires_at: number;
}

interface SberMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SberChatRequest {
  model: string;
  messages: SberMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface SberChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class SberGigaChatService {
  private config: SberConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: SberConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    // Проверяем, не истек ли токен
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const rqUid = crypto.randomUUID();
    const authKey = btoa(`${this.config.clientId}:${this.config.clientSecret}`);

    try {
      const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'RqUID': rqUid,
          'Authorization': `Basic ${authKey}`,
        },
        body: new URLSearchParams({
          scope: this.config.scope,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }

      const data: SberTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = data.expires_at * 1000; // Convert to milliseconds

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Sber access token:', error);
      throw new Error('Failed to authenticate with Sber GigaChat API');
    }
  }

  async chat(request: SberChatRequest): Promise<SberChatResponse> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
          stream: request.stream || false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sber API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling Sber GigaChat API:', error);
      throw new Error('Failed to get response from Sber GigaChat API');
    }
  }

  async getModels(): Promise<Array<{ id: string; object: string; created: number; owned_by: string }>> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/models', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get models: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting Sber models:', error);
      throw new Error('Failed to get available models from Sber GigaChat API');
    }
  }
}

// Создаем экземпляр сервиса с конфигурацией из переменных окружения
export const sberService = new SberGigaChatService({
  clientId: process.env.SBER_CLIENT_ID || '',
  clientSecret: process.env.SBER_CLIENT_SECRET || '',
  scope: process.env.SBER_SCOPE || 'GIGACHAT_API_PERS',
});
