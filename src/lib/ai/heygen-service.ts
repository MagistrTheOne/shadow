interface HeyGenConfig {
  apiKey: string;
  baseUrl: string;
}

interface HeyGenAvatar {
  id: string;
  name: string;
  avatar_url: string;
  preview_url: string;
  status: string;
}

interface HeyGenVideoRequest {
  avatar_id: string;
  text: string;
  voice_id?: string;
  background?: string;
  ratio?: string;
}

interface HeyGenVideoResponse {
  code: number;
  message: string;
  data: {
    video_id: string;
    video_url: string;
    duration: number;
    status: string;
  };
}

export class HeyGenService {
  private config: HeyGenConfig;
  private readonly ANNA_AVATAR_ID = "1652863dc2354b499db342a63feca19a";

  constructor() {
    this.config = {
      apiKey: process.env.HEYGEN_API_KEY!,
      baseUrl: "https://api.heygen.com/v1",
    };
  }

  /**
   * Получить информацию об аватаре ANNA
   */
  async getAnnaAvatar(): Promise<HeyGenAvatar> {
    const response = await fetch(`${this.config.baseUrl}/avatar.list`, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Найти ANNA по ID
    const anna = data.data.avatars.find((avatar: HeyGenAvatar) => 
      avatar.id === this.ANNA_AVATAR_ID
    );

    if (!anna) {
      throw new Error('ANNA avatar not found');
    }

    return anna;
  }

  /**
   * Создать видео с ANNA
   */
  async createAnnaVideo(text: string, options?: {
    voice_id?: string;
    background?: string;
    ratio?: string;
  }): Promise<HeyGenVideoResponse> {
    const requestBody: HeyGenVideoRequest = {
      avatar_id: this.ANNA_AVATAR_ID,
      text,
      voice_id: options?.voice_id || "1bd001e7c8f74e5ba8d4a16c8b5a7c8b", // ANNA's default voice
      background: options?.background || "transparent",
      ratio: options?.ratio || "16:9",
    };

    const response = await fetch(`${this.config.baseUrl}/video.generate`, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Получить статус видео
   */
  async getVideoStatus(videoId: string): Promise<HeyGenVideoResponse> {
    const response = await fetch(`${this.config.baseUrl}/video.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Получить список доступных голосов
   */
  async getVoices(): Promise<any[]> {
    const response = await fetch(`${this.config.baseUrl}/voice.list`, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.voices;
  }

  /**
   * Создать превью аватара ANNA
   */
  async createAnnaPreview(): Promise<string> {
    try {
      const anna = await this.getAnnaAvatar();
      return anna.preview_url || anna.avatar_url;
    } catch (error) {
      console.error('Error getting ANNA preview:', error);
      // Fallback изображение
      return '/images/anna-fallback.jpg';
    }
  }

  /**
   * Проверить доступность ANNA
   */
  async isAnnaAvailable(): Promise<boolean> {
    try {
      await this.getAnnaAvatar();
      return true;
    } catch (error) {
      console.error('ANNA is not available:', error);
      return false;
    }
  }
}

// Создаем singleton экземпляр
export const heygenService = new HeyGenService();
