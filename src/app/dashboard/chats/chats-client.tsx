"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquareIcon, PlusIcon, SearchIcon, UserIcon, BotIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ChatsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");

  const { data: chats, isLoading, refetch } = trpc.chats.getMany.useQuery();
  const { data: agents } = trpc.agents.getMany.useQuery();
  const { data: searchResults } = trpc.chats.searchUsers.useQuery(
    { query: userSearchQuery },
    { enabled: userSearchQuery.length > 0 }
  );
  
  const createChatMutation = trpc.chats.create.useMutation({
    onSuccess: (newChat) => {
      // Redirect to the new chat
      window.location.href = `/dashboard/chats/${newChat.id}`;
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
    },
  });

  const createUserChatMutation = trpc.chats.createUserChat.useMutation({
    onSuccess: (newChat) => {
      // Redirect to the new chat
      window.location.href = `/dashboard/chats/${newChat.id}`;
    },
    onError: (error) => {
      console.error("Error creating user chat:", error);
    },
  });

  useEffect(() => {
    if (agentId) {
      createChatMutation.mutate({ agentId });
    }
  }, [agentId, createChatMutation]);

  const filteredChats = chats?.filter((chat) =>
    (chat.title as string).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Chats</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chats</h1>
        <div className="flex space-x-2">
          <Dialog open={isUserSearchOpen} onOpenChange={setIsUserSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserIcon className="w-4 h-4 mr-2" />
                Chat with User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a chat with a user</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-search">Search by name, email, or ID</Label>
                  <Input
                    id="user-search"
                    placeholder="Enter name, email, or ID..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
                {searchResults && searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          createUserChatMutation.mutate({ participantId: user.id });
                          setIsUserSearchOpen(false);
                        }}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/dashboard/agents">
              <BotIcon className="w-4 h-4 mr-2" />
              Chat with Agent
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredChats?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquareIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No chats yet
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Start a conversation with an AI agent to see your chats here.
            </p>
            <Button asChild>
              <Link href="/dashboard/agents">
                <PlusIcon className="w-4 h-4 mr-2" />
                Start New Chat
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredChats?.map((chat) => (
            <Card key={chat.id as string} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link href={`/dashboard/chats/${chat.id}`}>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      {chat.chatType === "agent" ? (
                        <>
                          <AvatarImage src={(chat.agent as any)?.avatar || undefined} />
                          <AvatarFallback>
                            <BotIcon className="w-5 h-5" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={(chat.participant as any)?.avatarUrl || undefined} />
                          <AvatarFallback>
                            <UserIcon className="w-5 h-5" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chat.title as string}
                        </h3>
                        {chat.lastMessageAt && (
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(chat.lastMessageAt as string), {
                              addSuffix: true,
                              locale: ru,
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {chat.chatType === "agent" ? (
                          <>
                            <Badge variant="secondary" className="text-xs">
                              {(chat.agent as any)?.name}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {(chat.agent as any)?.provider}
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            User
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
