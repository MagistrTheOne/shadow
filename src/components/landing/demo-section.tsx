"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Mic, MicOff, Users, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";

export const DemoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "John Lecore Decora", message: "I think someone just joined our conversation...", timestamp: "10:30" },
    { id: 2, sender: "Anna AI", message: "Shhhh, they might be listening. Let's pretend we're working! Listen...", timestamp: "10:31" }
  ]);

  // Simulate meeting time
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const [minutes, seconds] = prev.split(':').map(Number);
          const totalSeconds = minutes * 60 + seconds + 1;
          const newMinutes = Math.floor(totalSeconds / 60);
          const newSeconds = totalSeconds % 60;
          return `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Simulate AI chat effect
  useEffect(() => {
    if (isPlaying) {
      const chatInterval = setInterval(() => {
        const newMessage = {
          id: Date.now(),
          sender: Math.random() > 0.5 ? "John Smith" : "AI Assistant",
          message: Math.random() > 0.5 
            ? "This AI integration is really impressive!"
            : "I agree, the real-time analysis is game-changing.",
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, newMessage]);
      }, 8000);

      return () => clearInterval(chatInterval);
    }
  }, [isPlaying]);

  return (
    <section id="demo" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6">
            <Play className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-white">Interactive </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Посмотрите{" "}
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              AI Аватары
            </span>{" "}
            в действии
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Посмотрите, как наши продвинутые AI аватары трансформируют профессиональные встречи с естественными разговорами, интеллектуальными инсайтами и бесшовной коллаборацией.
          </p>
        </div>

        {/* Demo Container */}
        <div className="relative">
          {/* Meeting Header */}
          <div className="bg-white/5 backdrop-blur-md rounded-t-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-500/80 backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Enterprise Meeting Demo</h3>
                  <p className="text-gray-400 text-sm">3 participants • AI Avatar Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-mono">{currentTime}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-red-500/80 backdrop-blur-sm hover:bg-red-600/80 text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Demo Area */}
          <div className="bg-white/5 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-4 p-6">
              {/* John Smith */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center mb-4">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg">John Smith</h4>
                <p className="text-gray-400 text-sm">Product Manager</p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs">Active</span>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center mb-4">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg">AI Assistant</h4>
                <p className="text-gray-400 text-sm">Enterprise AI</p>
                <div className="mt-4">
                  <Button size="sm" className="bg-blue-500/80 backdrop-blur-sm hover:bg-blue-600/80 text-white">
                    Active
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-white/5 backdrop-blur-md rounded-b-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <h4 className="text-white font-semibold">Live Chat</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs">AI is active...</span>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 max-h-48 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`mb-3 ${msg.sender === "AI Assistant" ? "text-right" : "text-left"}`}>
                    <div className={`inline-block max-w-xs p-3 rounded-lg backdrop-blur-sm ${
                      msg.sender === "AI Assistant" 
                        ? "bg-blue-500/20" 
                        : "bg-blue-500/20"
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center ${
                          msg.sender === "AI Assistant" ? "bg-blue-500/80" : "bg-blue-500/80"
                        }`}>
                          <Users className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-400">{msg.sender}</span>
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      </div>
                      <p className="text-white text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button
            asChild
            size="lg"
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-lg px-8 py-4"
          >
            <Link href="#demo">
              Получить доступ
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};