"use client";

import { useEffect, useRef, useState } from 'react';
import { HeyGenAvatar } from '@/components/heygen-avatar';
import { AvatarBrainService, AvatarBrainConfig } from '@/lib/avatar-brain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Brain, Settings } from 'lucide-react';

interface SmartAvatarProps {
  apiKey: string;
  meetingId: string;
  meetingType?: 'business' | 'casual' | 'presentation' | 'interview';
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export const SmartAvatar = ({
  apiKey,
  meetingId,
  meetingType = 'business',
  onReady,
  onError,
}: SmartAvatarProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('female');
  const [brainConfig, setBrainConfig] = useState<AvatarBrainConfig>({
    personality: 'professional',
    context: `Meeting ID: ${meetingId}`,
    meetingType,
    language: 'ru',
  });

  const brainServiceRef = useRef<AvatarBrainService | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Инициализируем мозг аватара
    brainServiceRef.current = new AvatarBrainService(brainConfig);

    // Настраиваем распознавание речи
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ru-RU';

      recognitionRef.current.onresult = async (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript && brainServiceRef.current) {
          setIsProcessing(true);
          try {
            const brainResponse = await brainServiceRef.current.processUserInput(finalTranscript);
            
            if (brainResponse.shouldSpeak) {
              // Здесь можно добавить логику для управления аватаром
              console.log('Avatar should speak:', brainResponse.response);
              console.log('Emotion:', brainResponse.emotion);
              console.log('Action:', brainResponse.action);
            }
          } catch (error) {
            console.error('Brain processing error:', error);
            onError?.(error as Error);
          } finally {
            setIsProcessing(false);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [brainConfig, meetingId, meetingType, onError]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      onError?.(new Error('Speech recognition not supported'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const handleGenderChange = (gender: 'male' | 'female') => {
    setAvatarGender(gender);
  };

  const handlePersonalityChange = (personality: AvatarBrainConfig['personality']) => {
    setBrainConfig(prev => ({ ...prev, personality }));
    brainServiceRef.current = new AvatarBrainService({ ...brainConfig, personality });
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col">
      {/* Avatar */}
      <div className="flex-1">
        <HeyGenAvatar
          apiKey={apiKey}
          gender={avatarGender}
          onReady={onReady}
          onError={onError}
          onGenderChange={handleGenderChange}
        />
      </div>

      {/* Smart Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <Card className="bg-black/50 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Brain
              </div>
              <Badge variant="secondary" className="text-xs">
                {brainConfig.personality}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {/* Voice Controls */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={isListening ? 'default' : 'outline'}
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className={`${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleMute}
                  className={`border-white/20 ${
                    isMuted ? 'text-red-400' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>

              {/* Personality Selector */}
              <div className="flex gap-1">
                {(['professional', 'friendly', 'assistant', 'expert'] as const).map((personality) => (
                  <Button
                    key={personality}
                    size="sm"
                    variant={brainConfig.personality === personality ? 'default' : 'outline'}
                    onClick={() => handlePersonalityChange(personality)}
                    className={`text-xs ${
                      brainConfig.personality === personality 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    {personality}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
              <span>
                {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
              </span>
              <span>
                {avatarGender === 'male' ? 'Male Avatar' : 'Female Avatar'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
