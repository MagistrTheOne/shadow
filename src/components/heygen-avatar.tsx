"use client";

import { useEffect, useRef, useState } from 'react';
import { HeyGenAvatarService } from '@/lib/heygen-avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Users, User } from 'lucide-react';

export type AvatarGender = 'male' | 'female';

interface HeyGenAvatarProps {
  apiKey: string;
  avatarId?: string;
  voiceId?: string;
  gender?: AvatarGender;
  language?: string;
  quality?: 'low' | 'medium' | 'high';
  onReady?: () => void;
  onError?: (error: Error) => void;
  onGenderChange?: (gender: AvatarGender) => void;
}

export const HeyGenAvatar = ({
  apiKey,
  avatarId,
  voiceId,
  gender = 'female',
  language = 'en',
  quality = 'medium',
  onReady,
  onError,
  onGenderChange,
}: HeyGenAvatarProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const avatarServiceRef = useRef<HeyGenAvatarService | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentGender, setCurrentGender] = useState<AvatarGender>(gender);

  // Получаем правильные ID в зависимости от пола
  const getAvatarConfig = (selectedGender: AvatarGender) => {
    if (selectedGender === 'male') {
      return {
        avatarId: avatarId || process.env.NEXT_PUBLIC_HEYGEN_MALE_AVATAR_ID || 'default-male',
        voiceId: voiceId || process.env.NEXT_PUBLIC_HEYGEN_MALE_VOICE_ID || 'default-male-voice',
      };
    } else {
      return {
        avatarId: avatarId || process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || 'default-female',
        voiceId: voiceId || process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID || 'default-female-voice',
      };
    }
  };

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        setIsLoading(true);
        
        const config = getAvatarConfig(currentGender);
        const avatarService = new HeyGenAvatarService({
          apiKey,
          avatarId: config.avatarId,
          voiceId: config.voiceId,
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
  }, [apiKey, currentGender, language, quality, onReady, onError]);

  const handleSpeak = async (text: string) => {
    if (!avatarServiceRef.current || !isReady) return;

    try {
      setIsSpeaking(true);
      await avatarServiceRef.current.speak(text);
    } catch (error) {
      console.error('Error during avatar speak:', error);
      onError?.(error as Error);
    } finally {
      setIsSpeaking(false);
    }
    };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    console.log(`Avatar audio ${isMuted ? 'unmuted' : 'muted'}`);
  };

  const handleGenderChange = (newGender: AvatarGender) => {
    setCurrentGender(newGender);
    onGenderChange?.(newGender);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col">
      {/* Gender Selection */}
      <div className="absolute top-4 left-4 z-20">
        <Card className="bg-black/50 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center">
              <Users className="w-4 h-4 mr-2" />
              AI Avatar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={currentGender === 'female' ? 'default' : 'outline'}
                onClick={() => handleGenderChange('female')}
                className={`text-xs ${
                  currentGender === 'female' 
                    ? 'bg-pink-600 hover:bg-pink-700' 
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <User className="w-3 h-3 mr-1" />
                Female
              </Button>
              <Button
                size="sm"
                variant={currentGender === 'male' ? 'default' : 'outline'}
                onClick={() => handleGenderChange('male')}
                className={`text-xs ${
                  currentGender === 'male' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <User className="w-3 h-3 mr-1" />
                Male
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white z-10">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading AI Avatar...</p>
          <Badge variant="secondary" className="mt-2">
            {currentGender === 'male' ? 'Male Avatar' : 'Female Avatar'}
          </Badge>
        </div>
      )}

      {/* Avatar Container */}
      <div ref={videoRef} className="w-full h-full">
        {/* HeyGen avatar will be rendered inside this div */}
      </div>
      
      {/* Controls */}
      {isReady && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-full backdrop-blur-sm">
          <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleSpeak("Hello, how can I assist you today?")} 
            disabled={isSpeaking}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            Speak
          </Button>
        </div>
      )}
    </div>
  );
};