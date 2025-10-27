import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

const STREAM_API_KEY = process.env.STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return NextResponse.json({ error: 'Stream API credentials not configured' }, { status: 500 });
    }

    const chatClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
    
    // Создаем токен для пользователя
    const token = chatClient.createToken(userId);

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Error generating Stream token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}