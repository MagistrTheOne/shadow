import { gigachatClient } from '@/lib/gigachat';

export interface AvatarBrainConfig {
  personality: 'professional' | 'friendly' | 'assistant' | 'expert';
  context: string;
  meetingType: 'business' | 'casual' | 'presentation' | 'interview';
  language: 'ru' | 'en';
}

export class AvatarBrainService {
  private config: AvatarBrainConfig;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  constructor(config: AvatarBrainConfig) {
    this.config = config;
  }

  async processUserInput(input: string, context?: string): Promise<{
    response: string;
    shouldSpeak: boolean;
    emotion?: 'happy' | 'neutral' | 'concerned' | 'excited';
    action?: 'nod' | 'shake' | 'point' | 'listen';
  }> {
    try {
      // Добавляем контекст встречи
      const systemPrompt = this.buildSystemPrompt();
      const userMessage = context ? `${input} (Context: ${context})` : input;

      // Добавляем в историю
      this.conversationHistory.push({ role: 'user', content: userMessage });

      // Получаем ответ от Gigachat
      const response = await gigachatClient.chat.completions.create({
        model: 'GigaChat:latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.conversationHistory.slice(-10), // Последние 10 сообщений для контекста
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content || 'Извините, я не понял.';
      
      // Добавляем ответ в историю
      this.conversationHistory.push({ role: 'assistant', content: aiResponse });

      // Анализируем ответ для определения эмоции и действия
      const analysis = this.analyzeResponse(aiResponse);

      return {
        response: aiResponse,
        shouldSpeak: true,
        emotion: analysis.emotion,
        action: analysis.action,
      };
    } catch (error) {
      console.error('Avatar Brain Error:', error);
      return {
        response: 'Извините, произошла ошибка. Попробуйте еще раз.',
        shouldSpeak: true,
        emotion: 'neutral',
        action: 'listen',
      };
    }
  }

  private buildSystemPrompt(): string {
    const personalityPrompts = {
      professional: 'Вы профессиональный AI-ассистент для деловых встреч. Отвечайте кратко и по делу.',
      friendly: 'Вы дружелюбный AI-ассистент. Отвечайте тепло и поддерживающе.',
      assistant: 'Вы полезный AI-ассистент. Предлагайте решения и помогайте с задачами.',
      expert: 'Вы эксперт в своей области. Давайте глубокие и обоснованные ответы.',
    };

    const meetingPrompts = {
      business: 'Это деловая встреча. Фокусируйтесь на бизнес-задачах и решениях.',
      casual: 'Это неформальная встреча. Общайтесь дружелюбно и непринужденно.',
      presentation: 'Это презентация. Помогайте с объяснениями и отвечайте на вопросы.',
      interview: 'Это интервью. Задавайте уточняющие вопросы и помогайте с анализом.',
    };

    const languagePrompts = {
      ru: 'Отвечайте на русском языке.',
      en: 'Respond in English.',
    };

    return `
${personalityPrompts[this.config.personality]}
${meetingPrompts[this.config.meetingType]}
${languagePrompts[this.config.language]}

Контекст встречи: ${this.config.context}

Правила:
1. Отвечайте кратко (максимум 2-3 предложения)
2. Будьте полезными и релевантными
3. Задавайте уточняющие вопросы при необходимости
4. Поддерживайте профессиональный тон
5. Не повторяйте информацию, которая уже была озвучена
    `.trim();
  }

  private analyzeResponse(response: string): {
    emotion: 'happy' | 'neutral' | 'concerned' | 'excited';
    action: 'nod' | 'shake' | 'point' | 'listen';
  } {
    const lowerResponse = response.toLowerCase();

    // Определяем эмоцию
    let emotion: 'happy' | 'neutral' | 'concerned' | 'excited' = 'neutral';
    
    if (lowerResponse.includes('отлично') || lowerResponse.includes('прекрасно') || lowerResponse.includes('замечательно')) {
      emotion = 'happy';
    } else if (lowerResponse.includes('проблема') || lowerResponse.includes('ошибка') || lowerResponse.includes('проблемы')) {
      emotion = 'concerned';
    } else if (lowerResponse.includes('важно') || lowerResponse.includes('срочно') || lowerResponse.includes('критично')) {
      emotion = 'excited';
    }

    // Определяем действие
    let action: 'nod' | 'shake' | 'point' | 'listen' = 'listen';
    
    if (lowerResponse.includes('да') || lowerResponse.includes('согласен') || lowerResponse.includes('правильно')) {
      action = 'nod';
    } else if (lowerResponse.includes('нет') || lowerResponse.includes('не согласен') || lowerResponse.includes('неправильно')) {
      action = 'shake';
    } else if (lowerResponse.includes('обратите внимание') || lowerResponse.includes('важно') || lowerResponse.includes('смотрите')) {
      action = 'point';
    }

    return { emotion, action };
  }

  async generateMeetingSummary(): Promise<string> {
    try {
      const summaryPrompt = `
Проанализируйте следующую беседу и создайте краткое резюме встречи:

${this.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Создайте резюме в формате:
1. Основные темы обсуждения
2. Ключевые решения
3. Следующие шаги
4. Вопросы для дальнейшего рассмотрения
      `;

      const response = await gigachatClient.chat.completions.create({
        model: 'GigaChat:latest',
        messages: [
          { role: 'system', content: 'Вы эксперт по анализу встреч. Создавайте структурированные резюме.' },
          { role: 'user', content: summaryPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Не удалось создать резюме встречи.';
    } catch (error) {
      console.error('Summary generation error:', error);
      return 'Ошибка при создании резюме встречи.';
    }
  }

  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}
