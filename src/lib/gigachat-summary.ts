import { gigachatClient } from '@/lib/gigachat';

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  participants: string[];
  duration: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export async function generateSummary(transcript: string): Promise<string> {
  try {
    const response = await gigachatClient.chat.completions.create({
      model: 'GigaChat:latest',
      messages: [
        {
          role: 'system',
          content: `Вы эксперт по анализу встреч. Создавайте структурированные резюме встреч на русском языке.

Формат резюме:
1. ОСНОВНЫЕ ТЕМЫ ОБСУЖДЕНИЯ
- Перечислите ключевые темы
2. КЛЮЧЕВЫЕ РЕШЕНИЯ
- Важные решения, принятые на встрече
3. СЛЕДУЮЩИЕ ШАГИ
- Конкретные действия и сроки
4. ВОПРОСЫ ДЛЯ РАССМОТРЕНИЯ
- Темы для будущих встреч

Будьте конкретными и структурированными.`
        },
        {
          role: 'user',
          content: `Создайте резюме следующей встречи:\n\n${transcript}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || 'Не удалось создать резюме встречи.';
  } catch (error) {
    console.error('Gigachat summary generation error:', error);
    return 'Ошибка при создании резюме встречи.';
  }
}

export async function generateDetailedAnalysis(transcript: string): Promise<MeetingSummary> {
  try {
    const response = await gigachatClient.chat.completions.create({
      model: 'GigaChat:latest',
      messages: [
        {
          role: 'system',
          content: `Вы эксперт по анализу встреч. Анализируйте встречи и предоставляйте детальную информацию.

Проанализируйте встречу и предоставьте:
1. Краткое резюме (2-3 предложения)
2. Ключевые моменты (список)
3. Действия (список с ответственными)
4. Участники (список имен)
5. Общий тон встречи (позитивный/нейтральный/негативный)

Отвечайте в формате JSON.`
        },
        {
          role: 'user',
          content: `Проанализируйте встречу:\n\n${transcript}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      const analysis = JSON.parse(content);
      return {
        summary: analysis.summary || '',
        keyPoints: analysis.keyPoints || [],
        actionItems: analysis.actionItems || [],
        participants: analysis.participants || [],
        duration: analysis.duration || 0,
        sentiment: analysis.sentiment || 'neutral',
      };
    } catch (parseError) {
      // Если JSON парсинг не удался, возвращаем базовую структуру
      return {
        summary: content,
        keyPoints: [],
        actionItems: [],
        participants: [],
        duration: 0,
        sentiment: 'neutral',
      };
    }
  } catch (error) {
    console.error('Gigachat detailed analysis error:', error);
    return {
      summary: 'Ошибка при анализе встречи.',
      keyPoints: [],
      actionItems: [],
      participants: [],
      duration: 0,
      sentiment: 'neutral',
    };
  }
}

export async function generateActionItems(transcript: string): Promise<string[]> {
  try {
    const response = await gigachatClient.chat.completions.create({
      model: 'GigaChat:latest',
      messages: [
        {
          role: 'system',
          content: 'Вы эксперт по извлечению задач из встреч. Извлекайте конкретные действия с ответственными и сроками.'
        },
        {
          role: 'user',
          content: `Извлеките действия из встречи:\n\n${transcript}\n\nФормат: "Задача - Ответственный - Срок"`
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Парсим действия из текста
    const actionItems = content
      .split('\n')
      .filter(line => line.trim() && line.includes('-'))
      .map(line => line.trim())
      .slice(0, 10); // Максимум 10 действий

    return actionItems;
  } catch (error) {
    console.error('Gigachat action items error:', error);
    return [];
  }
}

export async function generateKeyPoints(transcript: string): Promise<string[]> {
  try {
    const response = await gigachatClient.chat.completions.create({
      model: 'GigaChat:latest',
      messages: [
        {
          role: 'system',
          content: 'Вы эксперт по извлечению ключевых моментов из встреч. Выделяйте самые важные темы и решения.'
        },
        {
          role: 'user',
          content: `Выделите ключевые моменты встречи:\n\n${transcript}`
        }
      ],
      max_tokens: 800,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Парсим ключевые моменты
    const keyPoints = content
      .split('\n')
      .filter(line => line.trim() && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)))
      .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
      .slice(0, 8); // Максимум 8 ключевых моментов

    return keyPoints;
  } catch (error) {
    console.error('Gigachat key points error:', error);
    return [];
  }
}

export async function analyzeSentiment(transcript: string): Promise<'positive' | 'neutral' | 'negative'> {
  try {
    const response = await gigachatClient.chat.completions.create({
      model: 'GigaChat:latest',
      messages: [
        {
          role: 'system',
          content: 'Вы эксперт по анализу тональности. Определяйте общий тон встречи: позитивный, нейтральный или негативный.'
        },
        {
          role: 'user',
          content: `Определите тональность встречи:\n\n${transcript}\n\nОтветьте одним словом: positive, neutral или negative`
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content?.toLowerCase() || 'neutral';
    
    if (content.includes('positive') || content.includes('позитивный')) {
      return 'positive';
    } else if (content.includes('negative') || content.includes('негативный')) {
      return 'negative';
    }
    
    return 'neutral';
  } catch (error) {
    console.error('Gigachat sentiment analysis error:', error);
    return 'neutral';
  }
}
