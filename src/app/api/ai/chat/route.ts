import { NextRequest, NextResponse } from "next/server";
import { AvatarBrainService } from "@/lib/avatar-brain";

export async function POST(request: NextRequest) {
  try {
    const { message, meetingId, agentId, context } = await request.json();

    if (!message || !meetingId) {
      return NextResponse.json(
        { error: "Message and meetingId are required" },
        { status: 400 }
      );
    }

    // Создаем AI brain service с конфигурацией
    const brainService = new AvatarBrainService({
      personality: "assistant",
      context: context || "General meeting assistance",
      meetingType: "business",
      language: "ru",
    });

    // Обрабатываем пользовательский ввод
    const result = await brainService.processUserInput(message, context);

    return NextResponse.json({
      response: result.response,
      emotion: result.emotion,
      action: result.action,
      shouldSpeak: result.shouldSpeak,
    });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
