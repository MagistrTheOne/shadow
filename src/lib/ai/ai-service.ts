import { sberService } from './sber-service';
import { openaiService } from './openai-service';

export type AIProvider = 'sber' | 'openai';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  provider: AIProvider;
  model: string;
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface AIChatResponse {
  provider: AIProvider;
  model: string;
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
}

export class AIService {
  private sberService = sberService;
  private openaiService = openaiService;

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      let response;
      
      switch (request.provider) {
        case 'sber':
          response = await this.sberService.chat({
            model: request.model,
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            stream: request.stream,
          });
          break;
          
        case 'openai':
          response = await this.openaiService.chat({
            model: request.model,
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            stream: request.stream,
          });
          break;
          
        default:
          throw new Error(`Unsupported AI provider: ${request.provider}`);
      }

      return {
        provider: request.provider,
        model: request.model,
        content: response.choices[0]?.message?.content || '',
        usage: response.usage,
      };
    } catch (error) {
      console.error(`Error calling ${request.provider} AI service:`, error);
      throw new Error(`Failed to get response from ${request.provider} AI service`);
    }
  }

  async getModels(provider?: AIProvider): Promise<AIModel[]> {
    const models: AIModel[] = [];

    try {
      if (!provider || provider === 'sber') {
        const sberModels = await this.sberService.getModels();
        models.push(...sberModels.map(model => ({
          id: model.id,
          name: model.id,
          provider: 'sber' as AIProvider,
          description: `Sber GigaChat model: ${model.id}`,
        })));
      }

      if (!provider || provider === 'openai') {
        const openaiModels = await this.openaiService.getModels();
        models.push(...openaiModels.map(model => ({
          id: model.id,
          name: model.id,
          provider: 'openai' as AIProvider,
          description: `OpenAI model: ${model.id}`,
        })));
      }

      return models;
    } catch (error) {
      console.error('Error getting AI models:', error);
      throw new Error('Failed to get available AI models');
    }
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    const providers: AIProvider[] = [];
    
    try {
      // Проверяем доступность Sber
      await this.sberService.getModels();
      providers.push('sber');
    } catch (error) {
      console.warn('Sber GigaChat service not available:', error);
    }

    try {
      // Проверяем доступность OpenAI
      await this.openaiService.getModels();
      providers.push('openai');
    } catch (error) {
      console.warn('OpenAI service not available:', error);
    }

    return providers;
  }
}

// Создаем экземпляр сервиса
export const aiService = new AIService();

// Предустановленные модели для каждого провайдера
export const PRESET_MODELS: Record<AIProvider, string[]> = {
  sber: [
    'GigaChat:latest',
    'GigaChat:gpt-4',
    'GigaChat:gpt-3.5-turbo',
  ],
  openai: [
    'gpt-4',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
  ],
};
