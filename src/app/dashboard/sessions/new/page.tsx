"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Phone, MessageSquare, Bot, Clock } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { animations } from "@/lib/animations";

export default function CreateSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateSessionContent />
    </Suspense>
  );
}

function CreateSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionType, setSessionType] = useState<"call" | "chat">("call");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresIn, setExpiresIn] = useState("60"); // minutes
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // Get initial type from URL params
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "call" || type === "chat") {
      setSessionType(type);
    }
  }, [searchParams]);

  const { data: agents } = trpc.agents.getMany.useQuery();

  const createSession = trpc.sessions.create.useMutation({
    onSuccess: (session) => {
      toast.success("Session created successfully!");
      
      // Redirect based on session type
      if (session.type === "call") {
        router.push(`/dashboard/sessions/${session.id}/call`);
      } else if (session.type === "chat") {
        router.push(`/dashboard/sessions/${session.id}/chat`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setIsCreating(false);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a session title");
      return;
    }

    setIsCreating(true);
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn));

    createSession.mutate({
      type: sessionType,
      withAgents: selectedAgents.length > 0 ? selectedAgents : undefined,
      expiresAt: expiresAt?.toISOString(),
    });
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div className={`py-6 px-4 md:px-8 max-w-2xl mx-auto ${animations.pageEnter}`}>
      <div className="mb-6">
        <Button variant="ghost" asChild className="text-gray-400 hover:text-white mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold text-white mb-2">Create New Session</h1>
        <p className="text-gray-400">Start a video call or chat session with AI agents</p>
      </div>

      <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {sessionType === "call" ? (
              <Phone className="w-5 h-5 text-green-400" />
            ) : (
              <MessageSquare className="w-5 h-5 text-purple-400" />
            )}
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            {/* Session Type */}
            <div className="space-y-2">
              <Label className="text-white">Session Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={sessionType === "call" ? "default" : "outline"}
                  onClick={() => setSessionType("call")}
                  className={`h-12 flex-col gap-2 ${
                    sessionType === "call" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-white/20 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  Video Call
                </Button>
                <Button
                  type="button"
                  variant={sessionType === "chat" ? "default" : "outline"}
                  onClick={() => setSessionType("chat")}
                  className={`h-12 flex-col gap-2 ${
                    sessionType === "chat" 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : "border-white/20 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat
                </Button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Session Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Team Standup, Project Discussion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isCreating}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the session..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isCreating}
                rows={3}
              />
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expiresIn" className="text-white">
                Session Duration
              </Label>
              <Select value={expiresIn} onValueChange={setExpiresIn} disabled={isCreating}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Agents */}
            {agents && agents.length > 0 && (
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  AI Agents (Optional)
                </Label>
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAgents.includes(agent.id)
                          ? "bg-purple-500/20 border-purple-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => toggleAgent(agent.id)}
                    >
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{agent.name}</p>
                        <p className="text-gray-400 text-sm">{agent.provider} - {agent.model}</p>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedAgents.includes(agent.id)
                          ? "bg-purple-500 border-purple-500"
                          : "border-gray-400"
                      }`}>
                        {selectedAgents.includes(agent.id) && (
                          <div className="w-full h-full bg-white rounded-sm scale-50" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Button */}
            <Button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Create Session
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
