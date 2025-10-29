import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import { authClient } from '@/lib/auth-client';

const STREAM_API_KEY = process.env.STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return NextResponse.json({ error: 'Stream API credentials not configured' }, { status: 500 });
    }

    // Проверяем аутентификацию пользователя
    const session = await authClient.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Создаем токен для Stream Video
    const chatClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
    const token = chatClient.createToken(userId, Math.floor(Date.now() / 1000) + 3600);

    return NextResponse.json({ 
      token,
      apiKey: STREAM_API_KEY,
      userId,
      userName: userName || 'User'
    });
  } catch (error: any) {
    console.error('Error generating Stream token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}