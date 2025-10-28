"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PlayIcon, 
  PauseIcon, 
  Volume2Icon, 
  VolumeXIcon,
  SparklesIcon,
  BotIcon,
  Loader2Icon
} from "lucide-react";
import { heygenService } from "@/lib/ai/heygen-service";
import { toast } from "sonner";

interface AnnaAvatarProps {
  text?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const AnnaAvatar = ({ 
  text = "Привет! Я ANNA, ваш AI ассистент. Готова помочь с любыми вопросами!",
  autoPlay = false,
  showControls = true,
  size = "lg",
  className = ""
}: AnnaAvatarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [annaInfo, setAnnaInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48", 
    lg: "w-64 h-64",
    xl: "w-80 h-80"
  };

  useEffect(() => {
    loadAnnaInfo();
  }, []);

  useEffect(() => {
    if (autoPlay && text) {
      generateVideo();
    }
  }, [autoPlay, text]);

  const loadAnnaInfo = async () => {
    try {
      setIsLoading(true);
      const anna = await heygenService.getAnnaAvatar();
      setAnnaInfo(anna);
      setError(null);
    } catch (err) {
      console.error('Error loading ANNA info:', err);
      setError('ANNA недоступна в данный момент');
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await heygenService.createAnnaVideo(text, {
        voice_id: "1bd001e7c8f74e5ba8d4a16c8b5a7c8b", // ANNA's voice
        background: "transparent",
        ratio: "1:1"
      });

      if (response.code === 0) {
        setVideoUrl(response.data.video_url);
        setIsPlaying(true);
        toast.success("ANNA готова к общению!");
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Error generating ANNA video:', err);
      setError('Ошибка создания видео с ANNA');
      toast.error("Не удалось создать видео с ANNA");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (videoUrl) {
      setIsPlaying(!isPlaying);
    } else {
      generateVideo();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Card className={`bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border-purple-500/30 ${className}`}>
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SparklesIcon className="w-5 h-5 text-purple-400" />
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ANNA
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
            AI Avatar
          </Badge>
        </div>
        <p className="text-sm text-gray-400">
          Ваш персональный AI ассистент
        </p>
      </CardHeader>

      <CardContent className="text-center">
        <div className={`${sizeClasses[size]} mx-auto relative group`}>
          {/* ANNA Avatar */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-purple-500/30 shadow-2xl shadow-purple-500/20">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                <Loader2Icon className="w-12 h-12 text-purple-400 animate-spin" />
              </div>
            ) : videoUrl && isPlaying ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted={isMuted}
                className="w-full h-full object-cover"
                onEnded={() => setIsPlaying(false)}
              />
            ) : annaInfo ? (
              <img
                src={annaInfo.preview_url || annaInfo.avatar_url || "/images/anna-avatar.jpg"}
                alt="ANNA Avatar"
                className="w-full h-full object-cover"
              />
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <BotIcon className="w-12 h-12 text-gray-400" />
              </div>
            ) : (
              <img
                src="/images/anna-avatar.jpg"
                alt="ANNA Avatar"
                className="w-full h-full object-cover"
              />
            )}

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Status indicator */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button
              onClick={togglePlay}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </Button>

            {videoUrl && (
              <Button
                onClick={toggleMute}
                variant="outline"
                className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
              >
                {isMuted ? (
                  <VolumeXIcon className="w-4 h-4" />
                ) : (
                  <Volume2Icon className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        {/* ANNA info */}
        {annaInfo && (
          <div className="mt-3 text-xs text-gray-400">
            <p>Статус: {annaInfo.status}</p>
            <p>ID: {annaInfo.id}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
