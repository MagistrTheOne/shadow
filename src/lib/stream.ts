import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';

export function getStreamVideoClient(userId: string, userName: string) {
  return new StreamVideoClient({
    apiKey: process.env.STREAM_API_KEY!,
    user: { id: userId, name: userName },
    tokenProvider: async () => generateStreamToken(userId)
  });
}

export function getStreamChatClient() {
  return StreamChat.getInstance(process.env.STREAM_API_KEY!);
}

async function generateStreamToken(userId: string) {
  // Server-side token generation
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stream/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error('Failed to generate Stream token');
  }

  const data = await response.json();
  return data.token;
}
