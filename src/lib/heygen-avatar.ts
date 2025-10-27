// Временная заглушка для HeyGen Avatar до получения правильной документации
export interface HeyGenAvatarConfig {
  apiKey: string;
  avatarId: string;
  voiceId?: string;
  language?: string;
  quality?: 'low' | 'medium' | 'high';
}

export class HeyGenAvatarService {
  private config: HeyGenAvatarConfig;
  private container: HTMLElement | null = null;
  private isInitialized = false;

  constructor(config: HeyGenAvatarConfig) {
    this.config = config;
  }

  async initialize(container: HTMLElement): Promise<void> {
    try {
      this.container = container;
      
      // Создаем заглушку для демонстрации
      container.innerHTML = `
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 12px;">
          <div style="text-align: center; color: white;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <span style="font-size: 32px;">🤖</span>
            </div>
            <h3 style="margin: 0 0 8px; font-size: 18px;">AI Avatar</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Powered by HeyGen</p>
            <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.6;">Ready to speak</p>
          </div>
        </div>
      `;
      
      this.isInitialized = true;
      console.log('HeyGen Avatar initialized successfully (demo mode)');
    } catch (error) {
      console.error('Failed to initialize HeyGen Avatar:', error);
      throw error;
    }
  }

  async startSession(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Avatar not initialized');
    }
    console.log('HeyGen Avatar session started (demo mode)');
  }

  async speak(text: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Avatar not initialized');
    }

    try {
      // Симуляция речи
      console.log('Avatar speaking (demo mode):', text);
      
      // Обновляем UI для показа "говорит"
      if (this.container) {
        const statusElement = this.container.querySelector('p:last-child') as HTMLElement;
        if (statusElement) {
          statusElement.textContent = 'Speaking...';
          statusElement.style.color = '#4ade80';
          
          // Возвращаем обратно через 3 секунды
          setTimeout(() => {
            statusElement.textContent = 'Ready to speak';
            statusElement.style.color = 'rgba(255,255,255,0.6)';
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Failed to make avatar speak:', error);
      throw error;
    }
  }

  async stopSession(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }
    console.log('HeyGen Avatar session stopped (demo mode)');
  }

  getVideoElement(): HTMLVideoElement | null {
    // Возвращаем null для демо режима
    return null;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.isInitialized = false;
  }
}
