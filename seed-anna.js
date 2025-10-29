require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function seedAnnaAgent() {
  console.log('🔄 Seeding ANNA agent...');

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Создаем системного пользователя, если он не существует
    await sql`
      INSERT INTO "user" (id, name, email, "email_verified")
      VALUES ('system', 'System', 'system@shadow.ai', true)
      ON CONFLICT (id) DO NOTHING
    `;

    // Проверяем, существует ли уже ANNA агент
    const existing = await sql`SELECT id FROM agent WHERE id = '1652863dc2354b499db342a63feca19a'`;

    if (existing.length > 0) {
      console.log('✅ ANNA agent already exists');
      return;
    }

    // Создаем ANNA агента
    await sql`
      INSERT INTO agent (
        id, name, description, avatar, voice, instructions,
        provider, model, personality, capabilities, is_active, user_id
      ) VALUES (
        '1652863dc2354b499db342a63feca19a',
        'ANNA',
        'AI Assistant and mascot of Shadow.AI platform',
        'anna-avatar',
        'f8c69e517f424cafaecde32dde57096b',
        'You are ANNA, the AI assistant and mascot of Shadow.AI platform. Be friendly, helpful, and professional.',
        'sber',
        'GigaChat-Plus',
        '{"tone":"friendly","expertise":["meetings","ai_assistance"],"communication_style":"supportive"}'::jsonb,
        '{"can_schedule":true,"can_take_notes":true,"can_translate":true,"languages":["ru","en"]}'::jsonb,
        true,
        'system'
      ) ON CONFLICT (id) DO NOTHING
    `;

    console.log('✅ ANNA agent seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed ANNA agent:', error);
  }
}

seedAnnaAgent();
