"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, Video, Mic, Settings, Sparkles, Heart, Star } from "lucide-react";
import { AnnaAvatar } from "@/components/anna-avatar";
import { AnnaAgentIntegration } from "@/components/anna-agent-integration";
import { StreamAIChatbot } from "@/components/stream-ai-chatbot";
import { StreamAIModeration } from "@/components/stream-ai-moderation";
import { StreamActivityFeeds } from "@/components/stream-activity-feeds";
import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { toast } from "sonner";
import { useState } from "react";

export default function AnnaPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'video' | 'settings'>('chat');
  const [aiChatbotEnabled, setAiChatbotEnabled] = useState(false);
  const [aiModerationEnabled, setAiModerationEnabled] = useState(false);
  const [activityFeedsEnabled, setActivityFeedsEnabled] = useState(false);

  // Получаем данные ANNA агента
  const { data: annaAgent, isLoading, isError } = trpc.agents.getOne.useQuery({ 
    id: '1652863dc2354b499db342a63feca19a' 
  });

  if (isLoading) {
    return <LoadingState title="Loading ANNA..." description="Please wait" />;
  }

  if (isError || !annaAgent) {
    return <ErrorState title="ANNA Not Found" description="Unable to load ANNA agent" />;
  }

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AnnaAvatar
              size="large"
              className="w-24 h-24 border-4 border-purple-400/30 shadow-2xl shadow-purple-500/20"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              ANNA <span className="text-purple-400">AI Assistant</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Your personal AI companion for meetings, chats, and more
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Heart className="w-3 h-3 mr-1" />
                Always Online
              </Badge>
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'chat' && (
              <div className="space-y-6">
                {/* ANNA Chat Integration */}
                <AnnaAgentIntegration
                  agentId={annaAgent.id}
                  agentName={annaAgent.name}
                  agentPersonality={annaAgent.personality?.tone || "friendly"}
                  isActive={true}
                />

                {/* Stream AI ChatBot */}
                <StreamAIChatbot
                  callId="anna-chat"
                  isEnabled={aiChatbotEnabled}
                  onToggle={() => setAiChatbotEnabled(!aiChatbotEnabled)}
                />
              </div>
            )}

            {activeTab === 'video' && (
              <div className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Video className="w-5 h-5" />
                      Video Interaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <AnnaAvatar
                        size="large"
                        className="w-32 h-32 mx-auto"
                        isSpeaking={false}
                        isListening={false}
                      />
                      <p className="text-gray-300">
                        ANNA is ready for video calls and meetings
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Video className="w-4 h-4 mr-2" />
                          Start Video Call
                        </Button>
                        <Button variant="outline">
                          <Mic className="w-4 h-4 mr-2" />
                          Voice Only
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">ANNA Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-300">Personality</label>
                        <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm mt-1">
                          <option value="friendly">Friendly & Helpful</option>
                          <option value="professional">Professional</option>
                          <option value="casual">Casual & Fun</option>
                          <option value="technical">Technical Expert</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-300">Language</label>
                        <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm mt-1">
                          <option value="en">English</option>
                          <option value="ru">Russian</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300">System Prompt</label>
                      <textarea
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm mt-1 h-24 resize-none"
                        placeholder="Customize ANNA's behavior and responses..."
                        defaultValue="You are ANNA, a helpful AI assistant. Be friendly, professional, and always ready to help users with their tasks."
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Settings className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stream AI Moderation */}
            <StreamAIModeration
              callId="anna-chat"
              isEnabled={aiModerationEnabled}
              onToggle={() => setAiModerationEnabled(!aiModerationEnabled)}
            />

            {/* Stream Activity Feeds */}
            <StreamActivityFeeds
              isEnabled={activityFeedsEnabled}
              onToggle={() => setActivityFeedsEnabled(!activityFeedsEnabled)}
            />

            {/* ANNA Stats */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">ANNA Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Conversations</span>
                  <span className="text-white font-semibold">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Meetings Joined</span>
                  <span className="text-white font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Uptime</span>
                  <span className="text-green-400 font-semibold">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Satisfaction</span>
                  <span className="text-yellow-400 font-semibold">4.9/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
