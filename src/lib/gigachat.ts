import { getGigaChatAccessToken } from './gigachat-token';
import axios from 'axios';
import https from 'https';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

// Создаем axios instance с отключенной проверкой SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const gigachatAxios = axios.create({
  httpsAgent
});

export async function generateChatCompletion(request: ChatCompletionRequest) {
  const token = await getGigaChatAccessToken();
  
  try {
    const response = await gigachatAxios.post(`${process.env.SBER_API_URL}/chat/completions`, request, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Gigachat API error:', error.response?.status, error.response?.data || error.message);
    throw new Error(`GigaChat API error: ${error.response?.status || 'Network error'}`);
  }
}

export async function generateSummary(transcript: string) {
  const response = await generateChatCompletion({
    model: 'GigaChat',
    messages: [
      { 
        role: 'system', 
        content: 'Ты профессиональный ассистент. Создай краткое резюме встречи на основе транскрипта. Выдели ключевые моменты и action items.' 
      },
      { role: 'user', content: transcript }
    ],
    temperature: 0.5,
    max_tokens: 2048
  });
  
  return response.choices[0].message.content;
}

export async function answerQuestion(context: string, question: string) {
  const response = await generateChatCompletion({
    model: 'GigaChat',
    messages: [
      { 
        role: 'system', 
        content: `Ты ассистент для ответов на вопросы по транскрипту встречи. Используй только информацию из контекста.

Контекст встречи:
${context}` 
      },
      { role: 'user', content: question }
    ],
    temperature: 0.3,
    max_tokens: 1024
  });
  
  return response.choices[0].message.content;
}

export async function getAvailableModels() {
  const token = await getGigaChatAccessToken();
  
  try {
    const response = await gigachatAxios.get(`${process.env.SBER_API_URL}/models`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Gigachat models error:', error.response?.status, error.response?.data || error.message);
    throw new Error(`GigaChat models error: ${error.response?.status || 'Network error'}`);
  }
}

export async function generateEmbedding(text: string | string[]) {
  const token = await getGigaChatAccessToken();
  
  try {
    const response = await gigachatAxios.post(`${process.env.SBER_API_URL}/embeddings`, {
      model: 'Embeddings',
      input: text
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Gigachat embeddings error:', error.response?.status, error.response?.data || error.message);
    throw new Error(`GigaChat embeddings error: ${error.response?.status || 'Network error'}`);
  }
}

// OpenAI-compatible client interface for backward compatibility
export const gigachatClient = {
  chat: {
    completions: {
      create: async (request: ChatCompletionRequest) => {
        return await generateChatCompletion(request);
      }
    }
  }
};
