"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlayIcon, 
  PauseIcon, 
  Volume2Icon, 
  VolumeXIcon,
  SparklesIcon,
  MessageCircleIcon,
  VideoIcon,
  Loader2Icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { heygenService } from "@/lib/ai/heygen-service";

interface AnnaAvatarProps {
  variant?: 'dashboard' | 'profile' | 'meeting' | 'notification';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showControls?: boolean;
  autoPlay?: boolean;
  message?: string;
  className?: string;
}

export const AnnaAvatar = ({ 
  variant = 'dashboard', 
  size = 'md', 
  showControls = true,
  autoPlay = false,
  message,
  className 
}: AnnaAvatarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const variantStyles = {
    dashboard: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30',
    profile: 'bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-400/30',
    meeting: 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-400/30',
    notification: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30',
  };

  // Генерируем видео при монтировании компонента
  useEffect(() => {
    if (message) {
      generateVideo(message);
    } else if (variant === 'dashboard') {
      generateWelcomeVideo();
    }
  }, [message, variant]);

  const generateVideo = async (text: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await heygenService.createAnnaVideo(text);
      
      if (response.code === 0) {
        setVideoUrl(response.data.video_url);
        if (autoPlay) {
          setIsPlaying(true);
        }
      } else {
        setError(response.message || 'Failed to generate video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWelcomeVideo = async () => {
    const welcomeText = "Привет! Я ANNA, ваш AI ассистент. Готова помочь!";
    await generateVideo(welcomeText);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoClick = () => {
    if (videoUrl) {
      handlePlayPause();
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105",
      variantStyles[variant],
      sizeClasses[size],
      className
    )}>
      <CardHeader className="p-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
            <SparklesIcon className="w-3 h-3" />
            ANNA
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/30">
            AI
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 flex flex-col items-center justify-center h-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2Icon className="w-6 h-6 animate-spin text-white" />
            <span className="text-xs text-white/70">Создаю видео...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <MessageCircleIcon className="w-6 h-6 text-white/70" />
            </div>
            <span className="text-xs text-red-400 text-center">{error}</span>
          </div>
        ) : videoUrl ? (
          <div className="relative w-full h-full group">
            <video
              src={videoUrl}
              className="w-full h-full object-cover rounded-lg"
              muted={isMuted}
              loop
              autoPlay={isPlaying}
              onClick={handleVideoClick}
            />
            
            {/* Overlay controls */}
            {showControls && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handlePlayPause}
                    className="w-8 h-8 p-0 bg-white/20 hover:bg-white/30"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleMuteToggle}
                    className="w-8 h-8 p-0 bg-white/20 hover:bg-white/30"
                  >
                    {isMuted ? (
                      <VolumeXIcon className="w-4 h-4" />
                    ) : (
                      <Volume2Icon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <VideoIcon className="w-6 h-6 text-white/70" />
            </div>
            <span className="text-xs text-white/70 text-center">ANNA готовится...</span>
          </div>
        )}

        {/* Progress bar */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Специальные варианты ANNA для разных контекстов
export const AnnaDashboard = () => (
  <AnnaAvatar 
    variant="dashboard" 
    size="lg" 
    showControls={true}
    autoPlay={true}
    className="w-full max-w-sm"
  />
);

export const AnnaProfile = () => (
  <AnnaAvatar 
    variant="profile" 
    size="md" 
    showControls={false}
    autoPlay={true}
  />
);

export const AnnaMeeting = ({ message }: { message: string }) => (
  <AnnaAvatar 
    variant="meeting" 
    size="lg" 
    showControls={true}
    message={message}
    className="w-full max-w-md"
  />
);

export const AnnaNotification = ({ message }: { message: string }) => (
  <AnnaAvatar 
    variant="notification" 
    size="sm" 
    showControls={false}
    message={message}
  />
);
