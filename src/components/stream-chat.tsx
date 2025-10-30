"use client";

import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, MessageList, MessageInput, Thread, Window } from 'stream-chat-react';
import { useCall } from '@stream-io/video-react-sdk';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/trpc/client';
import { LoadingState } from '@/components/loading-state';
import { ErrorState } from '@/components/error-state';
import { toast } from 'sonner';

interface StreamChatProps {
  callId: string;
}

export function StreamChatComponent({ callId }: StreamChatProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const call = useCall();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const session = await authClient.getSession();
        const user = session.data?.user;
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Создаем Stream Chat клиент
        const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
        
        // Получаем подписанный Stream user token с сервера (API route)
        const tokenResp = await fetch('/api/stream/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name || 'User',
          }),
        });

        if (!tokenResp.ok) {
          throw new Error('Failed to get Stream token');
        }

        const { token } = await tokenResp.json();
        
        await client.connectUser(
          {
            id: user.id,
            name: user.name || 'User',
            image: user.image || undefined,
          },
          token
        );

        setChatClient(client);

        // Создаем или получаем канал для звонка
        // Согласно документации Stream Chat SDK: https://getstream.io/chat/docs/sdk/react/
        const channelId = `call-${callId}`;
        const channel = client.channel('messaging', channelId, {
          members: [user.id], // Добавляем текущего пользователя в участники
        });

        // Watch канала необходим для подписки на обновления
        await channel.watch();
        setChannel(channel);

        // Подключаем чат к звонку
        // if (call) {
        //   call.setChatChannel(channel);
        // }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Error initializing chat:', err);
        setError(err.message || 'Failed to initialize chat');
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [callId, call]);

  if (isLoading) {
    return <LoadingState title="Setting up chat..." description="Please wait" />;
  }

  if (error) {
    return <ErrorState title="Chat Error" description={error} />;
  }

  if (!chatClient || !channel) {
    return <ErrorState title="Chat Not Available" description="Unable to initialize chat" />;
  }

  return (
    <div className="h-full flex flex-col dashboard-card">
      <Chat client={chatClient} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <Window>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <MessageList />
              </div>
              <div className="border-t border-dashboard-border">
                <MessageInput />
              </div>
            </div>
            <Thread />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
}
