"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Mic, MicOff, Users, Clock } from "lucide-react";

export const DemoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");

  // Simulate meeting time
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const [minutes, seconds] = prev.split(':').map(Number);
          const newSeconds = seconds + 1;
          if (newSeconds >= 60) {
            return `${(minutes + 1).toString().padStart(2, '0')}:00`;
          }
          return `${minutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <section id="demo" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <Play className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-300">Interactive Demo</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            See{" "}
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              AI Avatars
            </span>{" "}
            in action
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience how our sophisticated AI avatars transform professional meetings with
            natural conversation, intelligent insights, and seamless collaboration.
          </p>
        </div>

        {/* Demo Container */}
        <div className="relative">
          {/* Main Demo Area */}
          <div className="relative bg-black/40 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
            {/* Meeting Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Enterprise Meeting Demo</h3>
                  <p className="text-gray-400 text-sm">3 participants • AI Avatar Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{currentTime}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
              {/* Human Participant */}
              <div className="relative bg-gray-900 rounded-2xl aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-white font-semibold">John Smith</p>
                  <p className="text-gray-400 text-sm">Product Manager</p>
                </div>
                <div className="absolute top-4 right-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* AI Avatar */}
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl aspect-video flex items-center justify-center border border-white/20">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Users className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-white font-semibold">AI Assistant</p>
                  <p className="text-gray-400 text-sm">Enterprise AI</p>
                  <div className="mt-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                    <span className="text-gray-300 text-xs">Active</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="border-t border-white/10 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <h4 className="text-white font-semibold">Live Chat</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <span className="text-gray-400 text-sm">AI is active...</span>
                </div>
              </div>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 max-w-xs">
                    <p className="text-white text-sm">Can you summarize the key points from our discussion?</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 max-w-xs">
                    <p className="text-white text-sm">I've identified 3 key action items: 1) Review Q4 metrics, 2) Schedule follow-up meeting, 3) Prepare budget proposal.</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-gray-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-500/10 rounded-full blur-xl animate-pulse delay-1000" />
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 text-lg px-8 py-4"
          >
            Schedule Enterprise Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
