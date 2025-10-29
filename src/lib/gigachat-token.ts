import { nanoid } from 'nanoid';
import axios from 'axios';
import https from 'https';

interface GigaChatToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: GigaChatToken | null = null;

// Создаем HTTPS агент с отключенной проверкой SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function getGigaChatAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.accessToken;
  }

  const rquid = nanoid();
  
  try {
    const response = await axios.post(process.env.SBER_OAUTH_URL!, 
      'scope=GIGACHAT_API_PERS',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'RqUID': rquid,
          'Authorization': `Basic ${process.env.SBER_AUTHORIZATION_KEY!}`
        },
        httpsAgent
      }
    );

    cachedToken = {
      accessToken: response.data.access_token,
      expiresAt: response.data.expires_at // Gigachat возвращает timestamp в миллисекундах
    };

    console.log('Gigachat access token obtained successfully');
    return cachedToken.accessToken;
  } catch (error: any) {
    console.error('Gigachat OAuth error:', error.response?.status, error.response?.data || error.message);
    throw new Error(`Failed to get GigaChat token: ${error.response?.status || 'Network error'}`);
  }
}
