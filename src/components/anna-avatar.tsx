"use client";

import { cn } from "@/lib/utils";
import { Bot, Sparkles } from "lucide-react";

interface AnnaAvatarProps {
  size?: "small" | "medium" | "large";
  className?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
}

export function AnnaAvatar({ 
  size = "medium", 
  className,
  isSpeaking = false,
  isListening = false 
}: AnnaAvatarProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16", 
    large: "w-24 h-24"
  };

  const iconSizes = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className={cn(
      "relative rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg",
      sizeClasses[size],
      className
    )}>
      {/* Speaking animation */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 animate-pulse" />
      )}
      
      {/* Listening animation */}
      {isListening && (
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping" />
      )}
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center">
        <Bot className={cn(
          "text-white",
          iconSizes[size]
        )} />
      </div>
      
      {/* Sparkle effect */}
      <div className="absolute -top-1 -right-1">
        <Sparkles className={cn(
          "text-yellow-400 animate-pulse",
          size === "small" ? "w-3 h-3" : size === "medium" ? "w-4 h-4" : "w-6 h-6"
        )} />
      </div>
    </div>
  );
}