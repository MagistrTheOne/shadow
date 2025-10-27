"use client";

import { useEffect, useRef, useState } from 'react';
import { HeyGenAvatarService } from '@/lib/heygen-avatar';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface HeyGenAvatarProps {
  apiKey: string;
  avatarId: string;
  voiceId?: string;
  language?: string;
  quality?: 'low' | 'medium' | 'high';
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export const HeyGenAvatar = ({
  apiKey,
  avatarId,
  voiceId,
  language = 'en',
  quality = 'medium',
  onReady,
  onError
}: HeyGenAvatarProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarServiceRef = useRef<HeyGenAvatarService | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        setIsLoading(true);
        
        const avatarService = new HeyGenAvatarService({
          apiKey,
          avatarId,
          voiceId,
          language,
          quality
        });

        if (videoRef.current) {
          await avatarService.initialize(videoRef.current);
          await avatarService.startSession();

          avatarServiceRef.current = avatarService;
          setIsReady(true);
          setIsLoading(false);
          
          onReady?.();
        }
      } catch (error) {
        console.error('Failed to initialize HeyGen Avatar:', error);
        setIsLoading(false);
        onError?.(error as Error);
      }
    };

    initializeAvatar();

    return () => {
      if (avatarServiceRef.current) {
        avatarServiceRef.current.destroy();
      }
    };
  }, [apiKey, avatarId, voiceId, language, quality, onReady, onError]);

  const handleSpeak = async (text: string) => {
    if (!avatarServiceRef.current || !isReady) return;

    try {
      setIsSpeaking(true);
      await avatarServiceRef.current.speak(text);
    } catch (error) {
      console.error('Failed to speak:', error);
      onError?.(error as Error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implement mute functionality
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/30 overflow-hidden">
      {/* Video Container */}
      <div className="relative w-full h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-semibold">Initializing AI Avatar...</p>
              <p className="text-purple-300 text-sm">Powered by HeyGen</p>
            </div>
          </div>
        ) : (
          <>
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              playsInline
            />
            
            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">AI Avatar Active</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMute}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  
                  {isSpeaking && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 rounded-full">
                      <Mic className="w-4 h-4 text-purple-300 animate-pulse" />
                      <span className="text-purple-300 text-sm">Speaking...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Avatar Info */}
            <div className="absolute top-4 left-4">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white font-semibold text-sm">AI Assistant</p>
                <p className="text-purple-300 text-xs">Powered by HeyGen</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Debug Controls (only in development) */}
      {process.env.NODE_ENV === 'development' && isReady && (
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            size="sm"
            onClick={() => handleSpeak("Hello! I'm your AI assistant. How can I help you today?")}
            disabled={isSpeaking}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Test Speech
          </Button>
        </div>
      )}
    </div>
  );
};
