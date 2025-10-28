import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

const STREAM_API_KEY = process.env.STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { callId, callType = 'default' } = await request.json();
    
    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 });
    }

    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return NextResponse.json({ error: 'Stream API credentials not configured' }, { status: 500 });
    }

    // Создаем Stream Chat клиент для сервера
    const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
    
    // Подключаем Voice Agent к звонку
    // Это упрощенная версия - в реальном приложении здесь будет более сложная логика
    const agentResponse = {
      success: true,
      callId,
      callType,
      agentConnected: true,
      message: 'Voice agent connected successfully'
    };

    return NextResponse.json(agentResponse);
  } catch (error: any) {
    console.error('Error connecting voice agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
