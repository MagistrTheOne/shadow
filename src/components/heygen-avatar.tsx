"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Users, Loader2, Play } from 'lucide-react';

interface HeyGenAvatarProps {
  apiKey?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export const HeyGenAvatar = ({ apiKey, onReady, onError }: HeyGenAvatarProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with demo video
    initializeDemo();
  }, []);

  const initializeDemo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create a demo talking avatar using HeyGen API
      if (apiKey) {
        await createTalkingAvatar("Привет! Я Shadow AI, ваш интеллектуальный помощник для встреч. Как дела?");
      } else {
        // Fallback to static demo
        setIsReady(true);
        setIsLoading(false);
        onReady?.();
      }
    } catch (err) {
      console.error('HeyGen initialization error:', err);
      setError('Failed to initialize HeyGen avatar');
      setIsLoading(false);
      onError?.(err as Error);
    }
  };

  const createTalkingAvatar = async (text: string) => {
    if (!apiKey) {
      throw new Error('HeyGen API key not provided');
    }

    try {
      setIsSpeaking(true);
      
      // HeyGen API call to create talking avatar
      const response = await fetch('https://api.heygen.com/v1/video.generate', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: "avatar",
                avatar_id: "1652863dc2354b499db342a63feca19a", // ANNA avatar ID
                avatar_style: "normal"
              },
              voice: {
                type: "text",
                input_text: text,
                voice_id: "1bd001e7e50f421d891986aad5158bc3", // Russian voice
                speed: 1.0,
                emotion: "friendly"
              }
            }
          ],
          dimension: {
            width: 1280,
            height: 720
          },
          aspect_ratio: "16:9"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HeyGen API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Poll for completion
      await pollForCompletion(result.data.video_id);
      
    } catch (err) {
      console.error('HeyGen API error:', err);
      setError('Failed to create talking avatar');
      setIsSpeaking(false);
      throw err;
    }
  };

  const pollForCompletion = async (videoId: string) => {
    const maxAttempts = 60; // 60 seconds max for HeyGen
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
          headers: {
            'X-API-KEY': apiKey!,
          }
        });

        if (!response.ok) {
          throw new Error(`Polling error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.data.status === 'completed') {
          setCurrentVideoUrl(result.data.video_url);
          setIsSpeaking(false);
          setIsReady(true);
          onReady?.();
          return;
        } else if (result.data.status === 'failed') {
          throw new Error(result.data.error_message || 'Video generation failed');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          throw new Error('Timeout waiting for video generation');
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError('Failed to generate video');
        setIsSpeaking(false);
      }
    };

    poll();
  };

  const handleSpeak = async (text: string) => {
    if (!apiKey) {
      // Fallback to Web Speech API
      speakWithWebSpeech(text);
      return;
    }

    try {
      await createTalkingAvatar(text);
    } catch (err) {
      console.error('Speak error:', err);
      onError?.(err as Error);
    }
  };

  const speakWithWebSpeech = (text: string) => {
    if (isMuted) return;
    
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleDemoSpeak = () => {
    const demoText = "Добро пожаловать в Shadow AI! Я ваш интеллектуальный помощник для встреч. Я могу помочь с анализом встреч, созданием заметок и совместной работой. Давайте сделаем ваши встречи более продуктивными!";
    handleSpeak(demoText);
  };

  const handleLiveStream = async () => {
    if (!apiKey) {
      onError?.(new Error('HeyGen API key required for live streaming'));
      return;
    }

    try {
      setIsSpeaking(true);
      
      // Create a live stream using HeyGen's streaming API
      const response = await fetch('https://api.heygen.com/v1/streaming.create', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_name: "ANNA",
          avatar_style: "normal",
          quality: "high",
          background: {
            type: "color",
            value: "#000000"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Stream creation error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Live stream created:', result);
      
      // Start WebRTC connection for real-time streaming
      // This would require additional WebRTC setup with HeyGen's streaming endpoint
      
    } catch (err) {
      console.error('Live stream error:', err);
      setError('Failed to create live stream');
      setIsSpeaking(false);
      onError?.(err as Error);
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col">
      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        {currentVideoUrl ? (
          <video
            ref={videoRef}
            src={currentVideoUrl}
            autoPlay
            loop
            muted={isMuted}
            className="w-full h-full object-contain p-4 rounded-lg"
            onLoadedData={() => setIsReady(true)}
            onError={() => setError('Video playback error')}
          />
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-16 h-16 text-white" />
            </div>
            <p className="text-white font-semibold mb-2">ANNA - Shadow AI Avatar</p>
            <p className="text-gray-400 text-sm mb-4">
              {apiKey ? 'Готов к созданию говорящего аватара ANNA' : 'Режим Web Speech API'}
            </p>
            {isSpeaking && (
              <div className="flex items-center justify-center text-purple-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Создание видео...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-full backdrop-blur-sm">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={toggleMute} 
          className="text-white hover:bg-white/20"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        
        <Button 
          size="sm" 
          onClick={handleDemoSpeak}
          disabled={isSpeaking || isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isSpeaking ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isSpeaking ? 'Generating...' : 'Demo'}
        </Button>
        
        {apiKey && (
          <Button 
            size="sm" 
            onClick={handleLiveStream}
            disabled={isSpeaking || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Live Stream
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-white z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Initializing HeyGen ANNA Avatar...</p>
            {!apiKey && (
              <p className="text-sm text-gray-400 mt-2">Using Web Speech API fallback</p>
            )}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${
          isReady ? 'bg-green-500' : 
          isSpeaking ? 'bg-blue-500 animate-pulse' : 
          'bg-gray-500'
        }`} />
      </div>
    </div>
  );
};
