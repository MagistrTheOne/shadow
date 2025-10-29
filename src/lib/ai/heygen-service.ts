interface HeyGenConfig {
  apiKey: string;
  baseUrl: string;
}

interface HeyGenVideoRequest {
  avatar_id: string;
  voice_id: string;
  text: string;
  language?: string;
  quality?: 'high' | 'medium' | 'low';
  background?: string;
  ratio?: '16:9' | '9:16' | '1:1';
}

interface HeyGenVideoResponse {
  code: number;
  message: string;
  data: {
    video_id: string;
    video_url: string;
    duration: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
}

interface HeyGenVideoStatus {
  code: number;
  message: string;
  data: {
    video_id: string;
    video_url?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    duration?: number;
  };
}

export class HeyGenService {
  private config: HeyGenConfig;

  constructor() {
    this.config = {
      apiKey: process.env.HEYGEN_API_KEY!,
      baseUrl: 'https://api.heygen.com/v1',
    };
  }

  /**
   * Создать видео с ANNA аватаром
   */
  async createAnnaVideo(text: string, options?: Partial<HeyGenVideoRequest>): Promise<HeyGenVideoResponse> {
    const request: HeyGenVideoRequest = {
      avatar_id: process.env.HEYGEN_ANNA_AVATAR_ID!,
      voice_id: process.env.HEYGEN_ANNA_VOICE_ID!,
      text,
      language: 'en',
      quality: 'high',
      ratio: '16:9',
      ...options,
    };

    const response = await fetch(`${this.config.baseUrl}/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.config.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Получить статус видео
   */
  async getVideoStatus(videoId: string): Promise<HeyGenVideoStatus> {
    const response = await fetch(`${this.config.baseUrl}/video/${videoId}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Создать видео с любым аватаром
   */
  async createVideo(request: HeyGenVideoRequest): Promise<HeyGenVideoResponse> {
    const response = await fetch(`${this.config.baseUrl}/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.config.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Получить список доступных аватаров
   */
  async getAvatars() {
    const response = await fetch(`${this.config.baseUrl}/avatar.list`, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Получить список доступных голосов
   */
  async getVoices() {
    const response = await fetch(`${this.config.baseUrl}/voice.list`, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Создать видео с ANNA для приветствия
   */
  async createAnnaWelcomeVideo(userName: string): Promise<HeyGenVideoResponse> {
    const welcomeText = `Привет, ${userName}! Я ANNA, ваш AI ассистент в Shadow.AI. Готова помочь вам с митингами, агентами и всем остальным!`;
    
    return this.createAnnaVideo(welcomeText, {
      language: 'ru',
      quality: 'high',
      ratio: '16:9',
    });
  }

  /**
   * Создать видео с ANNA для уведомлений
   */
  async createAnnaNotificationVideo(message: string): Promise<HeyGenVideoResponse> {
    return this.createAnnaVideo(message, {
      language: 'ru',
      quality: 'medium',
      ratio: '1:1',
    });
  }

  /**
   * Создать видео с ANNA для митингов
   */
  async createAnnaMeetingVideo(meetingTitle: string, action: 'start' | 'end' | 'reminder'): Promise<HeyGenVideoResponse> {
    let text = '';
    
    switch (action) {
      case 'start':
        text = `Митинг "${meetingTitle}" начинается! Присоединяйтесь!`;
        break;
      case 'end':
        text = `Митинг "${meetingTitle}" завершен. Спасибо за участие!`;
        break;
      case 'reminder':
        text = `Напоминание: митинг "${meetingTitle}" начнется через 15 минут!`;
        break;
    }
    
    return this.createAnnaVideo(text, {
      language: 'ru',
      quality: 'high',
      ratio: '16:9',
    });
  }
}

// Экспортируем единственный экземпляр
export const heygenService = new HeyGenService();
