"use client";

import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelList, MessageList, MessageInput, Thread, Window } from 'stream-chat-react';
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
        
        // Получаем подписанный Stream user token с сервера (tRPC)
        const tokenResp = await trpc.stream.getUserToken.fetch();
        await client.connectUser(
          {
            id: user.id,
            name: user.name || 'User',
            image: user.image || undefined,
          },
          tokenResp.token
        );

        setChatClient(client);

        // Создаем или получаем канал для звонка
        const channelId = `call-${callId}`;
        const channel = client.channel('messaging', channelId);

        await channel.create();
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
    <div className="h-full">
      <Chat client={chatClient} theme="str-chat__theme-dark">
        <ChannelList
          filters={{ type: 'messaging' }}
          sort={{ last_message_at: -1 }}
        />
        <Channel channel={channel}>
          <Window>
            <MessageList />
            <MessageInput />
            <Thread />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
}
