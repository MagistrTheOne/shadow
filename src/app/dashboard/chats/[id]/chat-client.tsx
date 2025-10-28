"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SendIcon, ArrowLeftIcon, BotIcon, UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ChatClientProps {
  chatId: string;
}

export function ChatClient({ chatId }: ChatClientProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chat, isLoading: chatLoading } = trpc.chats.getById.useQuery({
    chatId,
  });

  const { data: messages, isLoading: messagesLoading } =
    trpc.chats.getMessages.useQuery({
      chatId,
      limit: 50,
    });

  const sendMessageMutation = trpc.chats.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setIsLoading(false);
    },
  });

  const markAsReadMutation = trpc.chats.markMessagesAsRead.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const unreadMessageIds = messages
        .filter((msg) => !msg.isRead && msg.senderId !== chat?.userId)
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        markAsReadMutation.mutate({
          chatId,
          messageIds: unreadMessageIds,
        });
      }
    }
  }, [messages, chat?.userId, chatId, markAsReadMutation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    sendMessageMutation.mutate({
      chatId,
      content: message.trim(),
      messageType: "text",
    });
  };

  if (chatLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="border-b p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Chat not found</h2>
        <Button asChild>
          <Link href="/dashboard/chats">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Chats
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/chats">
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={chat.agent.avatar || undefined} />
            <AvatarFallback>
              {chat.agent.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">{chat.title}</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {chat.agent.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {chat.agent.provider}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex space-x-3 ${
                msg.senderId === chat.userId ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={msg.sender.avatarUrl || undefined} />
                <AvatarFallback>
                  {msg.senderId === chat.userId ? (
                    <UserIcon className="w-4 h-4" />
                  ) : (
                    <BotIcon className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId === chat.userId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === chat.userId
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatDistanceToNow(msg.createdAt, {
                    addSuffix: true,
                    locale: ru,
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim() || isLoading}>
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
