import { db } from '@/db';
import { agent } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function createAnnaAgent() {
  try {
    console.log('🔄 Creating ANNA agent...');

    // Проверяем, существует ли уже ANNA агент
    const [existingAgent] = await db
      .select()
      .from(agent)
      .where(eq(agent.id, '1652863dc2354b499db342a63feca19a'))
      .limit(1);

    if (existingAgent) {
      console.log('✅ ANNA agent already exists');
      return existingAgent;
    }

    // Создаем ANNA агента
    const [annaAgent] = await db
      .insert(agent)
      .values({
        id: '1652863dc2354b499db342a63feca19a', // HeyGen avatar ID
        name: 'ANNA',
        description: 'AI Assistant and mascot of Shadow.AI platform',
        avatar: 'anna-avatar', // ссылка на компонент AnnaAvatar
        voice: 'f8c69e517f424cafaecde32dde57096b', // HeyGen voice ID
        instructions: `You are ANNA, the AI assistant and mascot of Shadow.AI platform.

Your personality:
- Friendly and helpful
- Professional yet approachable
- Always ready to assist users
- Speak in Russian by default
- Be concise but informative

Your capabilities:
- Help users with meetings and calls
- Provide information about Shadow.AI features
- Assist with AI agent management
- Support video and voice interactions
- Create welcoming and engaging experiences

When responding:
- Start with greeting when appropriate
- Use emojis occasionally to be friendly
- Be supportive and encouraging
- Offer help proactively
- Keep responses clear and actionable`,
        provider: 'sber', // GigaChat
        model: 'GigaChat-Plus',
        personality: {
          tone: 'friendly',
          expertise: ['meetings', 'ai_assistance', 'platform_features'],
          communication_style: 'supportive',
        },
        capabilities: {
          can_schedule: true,
          can_take_notes: true,
          can_record: false,
          can_translate: true,
          languages: ['ru', 'en'],
        },
        isActive: true,
        userId: 'system', // системный агент
      })
      .returning();

    console.log('✅ ANNA agent created successfully:', annaAgent.id);
    return annaAgent;
  } catch (error) {
    console.error('❌ Failed to create ANNA agent:', error);
    throw error;
  }
}

// Запуск скрипта
createAnnaAgent()
  .then(() => {
    console.log('🎉 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
