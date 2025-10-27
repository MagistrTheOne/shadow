"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-client";
import { StreamChat, Channel, MessageList, MessageInput, useChannelStateContext } from "@stream-io/react-chat-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Mic, MicOff } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

interface MeetingChatProps {
  meetingId: string;
  participants: Array<{
    id: string;
    name: string;
    isOnline: boolean;
  }>;
}

export const MeetingChat = ({ meetingId, participants }: MeetingChatProps) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const chatClientRef = useRef<any>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Получаем токен для Stream Chat
        const response = await fetch('/api/stream/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            userName: user?.name || 'Guest',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get Stream token');
        }

        const { token } = await response.json();

        // Инициализируем Stream Chat клиент
        const { StreamChat: StreamChatSDK } = await import('@stream-io/react-chat-sdk');
        
        const client = StreamChatSDK.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
        
        await client.connectUser(
          {
            id: user?.id!,
            name: user?.name || 'Guest',
            image: user?.image,
          },
          token
        );

        chatClientRef.current = client;
        setIsConnected(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize chat');
        setIsLoading(false);
      }
    };

    if (user) {
      initializeChat();
    }

    return () => {
      if (chatClientRef.current) {
        chatClientRef.current.disconnectUser();
      }
    };
  }, [user]);

  if (isLoading) {
    return <LoadingState title="Connecting to chat..." description="Setting up real-time messaging" />;
  }

  if (error) {
    return <ErrorState title="Chat Error" description={error} />;
  }

  if (!isConnected || !chatClientRef.current) {
    return <ErrorState title="Chat Not Connected" description="Unable to connect to chat service" />;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Meeting Chat</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{participants.length}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className={isMuted ? "text-red-500" : "text-green-500"}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <StreamChat client={chatClientRef.current}>
          <Channel channelId={`meeting-${meetingId}`} channelType="messaging">
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-hidden">
                <MessageList />
              </div>
              <div className="border-t p-3">
                <MessageInput />
              </div>
            </div>
          </Channel>
        </StreamChat>
      </CardContent>
    </Card>
  );
};

// Компонент для отображения участников встречи
export const MeetingParticipants = ({ participants }: { participants: MeetingChatProps['participants'] }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Participants</h4>
      <div className="space-y-1">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-gray-600 dark:text-gray-400">{participant.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
