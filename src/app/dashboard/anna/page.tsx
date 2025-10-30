"use client";

import { Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Video,
  Mic,
  Settings,
  Sparkles,
  Heart,
  Star,
} from "lucide-react";
import { AnnaAvatar } from "@/components/anna-avatar";
import { AnnaAgentIntegration } from "@/components/anna-agent-integration";
import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { toast } from "sonner";

export default function AnnaPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "video" | "settings">("chat");

  const { data: annaAgent, isLoading, isError } = trpc.agents.getOne.useQuery({
    id: "1652863dc2354b499db342a63feca19a",
  });

  if (isLoading) return <LoadingState title="Loading ANNA..." description="Please wait" />;
  if (isError || !annaAgent)
    return <ErrorState title="ANNA Not Found" description="Unable to load ANNA agent" />;

  const tabs = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "video", label: "Video", icon: Video },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <AnnaAvatar
            size="large"
            className="w-24 h-24 border-4 border-purple-400/30 shadow-2xl shadow-purple-500/20 mx-auto"
          />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              ANNA <span className="text-purple-400">AI Assistant</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Your personal AI companion for meetings, chats, and more
            </p>
            <div className="flex justify-center gap-2 mt-3">
              {[
                {
                  icon: Sparkles,
                  color: "purple",
                  text: "AI Powered",
                },
                { icon: Heart, color: "blue", text: "Always Online" },
                { icon: Star, color: "pink", text: "Premium" },
              ].map(({ icon: Icon, color, text }) => (
                <Badge
                  key={text}
                  className={`bg-${color}-500/20 text-${color}-300 border-${color}-400/30 flex items-center`}
                >
                  <Icon className="w-3 h-3 mr-1" /> {text}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 transition-all ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "chat" && (
              <>
                <AnnaAgentIntegration
                  agentId={annaAgent.id}
                  agentName={annaAgent.name}
                  agentPersonality={annaAgent.personality?.tone || "friendly"}
                  isActive
                />
              </>
            )}

            {activeTab === "video" && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
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
                        <Video className="w-4 h-4 mr-2" /> Start Video Call
                      </Button>
                      <Button variant="outline">
                        <Mic className="w-4 h-4 mr-2" /> Voice Only
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "settings" && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">ANNA Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Personality",
                        options: [
                          "Friendly & Helpful",
                          "Professional",
                          "Casual & Fun",
                          "Technical Expert",
                        ],
                      },
                      {
                        label: "Language",
                        options: ["English", "Russian", "Spanish", "French"],
                      },
                    ].map(({ label, options }) => (
                      <div key={label}>
                        <label className="text-sm text-gray-300">{label}</label>
                        <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm mt-1">
                          {options.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">System Prompt</label>
                    <textarea
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm mt-1 h-24 resize-none"
                      placeholder="Customize ANNA's behavior..."
                      defaultValue="You are ANNA, a helpful AI assistant. Be friendly, professional, and always ready to help users with their tasks."
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Settings className="w-4 h-4 mr-2" /> Save Configuration
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">ANNA Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Conversations", "1,247"],
                  ["Meetings Joined", "89"],
                  ["Uptime", "99.9%", "text-green-400"],
                  ["Satisfaction", "4.9/5", "text-yellow-400"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-300">{label}</span>
                    <span className={`${color ?? "text-white"} font-semibold`}>
                      {value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
