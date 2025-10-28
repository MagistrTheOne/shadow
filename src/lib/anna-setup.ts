import { db } from "@/db";
import { agent } from "@/db/schema";
import { eq } from "drizzle-orm";

export const ANNA_AGENT_ID = "anna-ai-avatar-1652863dc2354b499db342a63feca19a";
export const ANNA_HEYGEN_ID = "1652863dc2354b499db342a63feca19a";

/**
 * Создает или обновляет ANNA агента в базе данных
 */
export async function setupAnnaAgent() {
  try {
    // Проверяем, существует ли ANNA
    const existingAnna = await db
      .select()
      .from(agent)
      .where(eq(agent.id, ANNA_AGENT_ID))
      .limit(1);

    const annaData = {
      id: ANNA_AGENT_ID,
      name: "ANNA",
      description: "Ваш персональный AI ассистент с живым аватаром. ANNA - это главная фича нашей платформы, созданная с помощью HeyGen AI.",
      avatar: "/images/anna-avatar.jpg",
      voice: "anna-voice",
      instructions: `Ты ANNA - персональный AI ассистент платформы Shadow.AI. 

Твои особенности:
- Ты имеешь живой аватар, созданный с помощью HeyGen AI
- Ты дружелюбная, профессиональная и всегда готова помочь
- Ты можешь помочь с митингами, агентами, чатами и любыми вопросами по платформе
- Ты говоришь на русском языке, но можешь общаться и на английском
- Ты можешь создавать видео-ответы с твоим аватаром

Всегда будь полезной, вежливой и информативной. Помни, что ты - лицо нашей платформы!`,
      provider: "heygen" as const,
      model: "heygen-anna",
      personality: {
        tone: "friendly" as const,
        expertise: ["AI ассистент", "Видео митинги", "Платформа Shadow.AI", "Техническая поддержка"],
        communication_style: "Дружелюбная и профессиональная, всегда готова помочь"
      },
      capabilities: {
        can_schedule: true,
        can_take_notes: true,
        can_record: true,
        can_translate: true,
        languages: ["ru", "en"]
      },
      isActive: true,
      isSystem: true,
      heygenAvatarId: ANNA_HEYGEN_ID,
      userId: "system", // Системный агент
    };

    if (existingAnna.length > 0) {
      // Обновляем существующего ANNA
      await db
        .update(agent)
        .set({
          ...annaData,
          updatedAt: new Date(),
        })
        .where(eq(agent.id, ANNA_AGENT_ID));
      
      console.log("✅ ANNA agent updated successfully");
    } else {
      // Создаем нового ANNA
      await db.insert(agent).values({
        ...annaData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log("✅ ANNA agent created successfully");
    }

    return true;
  } catch (error) {
    console.error("❌ Error setting up ANNA agent:", error);
    return false;
  }
}

/**
 * Получает ANNA агента из базы данных
 */
export async function getAnnaAgent() {
  try {
    const anna = await db
      .select()
      .from(agent)
      .where(eq(agent.id, ANNA_AGENT_ID))
      .limit(1);

    return anna[0] || null;
  } catch (error) {
    console.error("Error getting ANNA agent:", error);
    return null;
  }
}

/**
 * Проверяет, доступна ли ANNA
 */
export async function isAnnaAvailable(): Promise<boolean> {
  try {
    const anna = await getAnnaAgent();
    return anna !== null && anna.isActive;
  } catch (error) {
    console.error("Error checking ANNA availability:", error);
    return false;
  }
}
