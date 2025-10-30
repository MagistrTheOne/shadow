"use client";

import { useEffect, useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { StreamChat } from "stream-chat";
import { Chat, Channel, MessageList, MessageInput, Window } from "stream-chat-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Mic, MicOff, BotIcon } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface MeetingChatProps {
  meetingId: string;
  participants: Array<{
    id: string;
    name: string;
    isOnline: boolean;
  }>;
}

export const MeetingChat = ({ meetingId, participants }: MeetingChatProps) => {
  const { data: user } = authClient.useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [isAskingAI, setIsAskingAI] = useState(false);
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
            userId: user?.user?.id,
            userName: user?.user?.name || 'Guest',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get Stream token');
        }

        const { token } = await response.json();

        // Инициализируем Stream Chat клиент согласно документации
        // https://getstream.io/chat/docs/sdk/react/
        const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);

        await client.connectUser(
          {
            id: user?.user?.id!,
            name: user?.user?.name || 'Guest',
            image: user?.user?.image || undefined,
          },
          token
        );

        // Создаем или получаем канал для встречи
        const channelId = `meeting-${meetingId}`;
        const channel = client.channel('messaging', channelId, {
          members: [user?.user?.id!],
        });

        // Watch канала для подписки на обновления (обязательно по документации)
        await channel.watch();

        // Сохраняем channel в ref для использования
        chatClientRef.current = client;
        chatClientRef.current.channel = channel;
        
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

  const askAI = async () => {
    if (!aiQuestion.trim()) return;

    setIsAskingAI(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: aiQuestion,
          meetingId,
          context: "meeting_assistance",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      // Send AI response to chat
      if (chatClientRef.current && chatClientRef.current.channel) {
        await chatClientRef.current.channel.sendMessage({
          text: `[AI Assistant]: ${data.response || "Извините, я не смог обработать ваш запрос."}`,
          user_id: "ai-assistant",
        });
      }

      setAiQuestion("");
      toast.success("AI response sent to chat");
    } catch (error) {
      console.error("AI chat error:", error);
      toast.error("Failed to get AI response");
    } finally {
      setIsAskingAI(false);
    }
  };

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
        {/* AI Question Input */}
        <div className="border-b p-3 bg-blue-900/10">
          <div className="flex items-center gap-2 mb-2">
            <BotIcon className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">Ask AI Assistant</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && askAI()}
              placeholder="Ask a question to AI..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400"
            />
            <Button
              onClick={askAI}
              disabled={isAskingAI || !aiQuestion.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAskingAI ? "..." : "Ask"}
            </Button>
          </div>
        </div>

        {chatClientRef.current?.channel && (
          <Chat client={chatClientRef.current}>
            <Channel channel={chatClientRef.current.channel}>
              <Window>
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto">
                    <MessageList />
                  </div>
                  <div className="border-t border-dashboard-border">
                    <MessageInput />
                  </div>
                </div>
              </Window>
            </Channel>
          </Chat>
        )}
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
