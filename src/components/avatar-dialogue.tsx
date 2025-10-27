"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Users, Loader2, MessageSquareText } from 'lucide-react';

interface DialogueLine {
  speaker: 'john' | 'ai';
  text: string;
  voice: string;
  duration: number;
}

interface AvatarDialogueProps {
  apiKey?: string;
  onDialogueFinished?: () => void;
  onError?: (error: Error) => void;
}

const dialogueScript: DialogueLine[] = [
  {
    speaker: 'john',
    text: 'Привет! Это новая платформа Shadow AI?',
    voice: 'ru-RU-DmitryNeural',
    duration: 3000
  },
  {
    speaker: 'ai',
    text: 'Да! Добро пожаловать, Джон. Как дела?',
    voice: 'ru-RU-SvetlanaNeural',
    duration: 3000
  },
  {
    speaker: 'john',
    text: 'О, эти кожаные мешки всё ещё используют Zoom? Хехе!',
    voice: 'ru-RU-DmitryNeural',
    duration: 4000
  },
  {
    speaker: 'ai',
    text: 'Ха-ха! Ну, мы здесь, чтобы это изменить. Shadow AI - будущее встреч!',
    voice: 'ru-RU-SvetlanaNeural',
    duration: 4000
  },
  {
    speaker: 'john',
    text: 'А что умеет эта платформа? Расскажи подробнее!',
    voice: 'ru-RU-DmitryNeural',
    duration: 3500
  },
  {
    speaker: 'ai',
    text: 'Мы можем анализировать встречи в реальном времени, создавать умные заметки и даже помогать с принятием решений!',
    voice: 'ru-RU-SvetlanaNeural',
    duration: 5000
  },
  {
    speaker: 'john',
    text: 'Вау! Это звучит как из будущего! А когда пользователи смогут попробовать?',
    voice: 'ru-RU-DmitryNeural',
    duration: 4000
  },
  {
    speaker: 'ai',
    text: 'Прямо сейчас! Кстати, я вижу, что кто-то хочет присоединиться к нашему разговору...',
    voice: 'ru-RU-SvetlanaNeural',
    duration: 4000
  }
];

export const AvatarDialogue = ({ apiKey, onDialogueFinished, onError }: AvatarDialogueProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDialogueFinished, setIsDialogueFinished] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'john' | 'ai' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  const johnVideoRef = useRef<HTMLVideoElement>(null);
  const aiVideoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Автоматически запускаем диалог при загрузке
    console.log('AvatarDialogue mounted, API Key:', apiKey ? 'Present' : 'Missing');
    startDialogue();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startDialogue = async () => {
    setIsPlaying(true);
    await playNextLine();
  };

  const playNextLineWithWebSpeech = async () => {
    if (currentLineIndex >= dialogueScript.length) {
      // Диалог завершен
      setIsDialogueFinished(true);
      setIsPlaying(false);
      setCurrentSpeaker(null);
      onDialogueFinished?.();
      return;
    }

    const currentLine = dialogueScript[currentLineIndex];
    setCurrentSpeaker(currentLine.speaker);

    try {
      await speakWithWebSpeech(currentLine);

      // Ждем завершения реплики, затем переходим к следующей
      timeoutRef.current = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        playNextLineWithWebSpeech();
      }, currentLine.duration);

    } catch (error) {
      console.error('Error playing dialogue line:', error);
      onError?.(error as Error);
    }
  };

  const playNextLine = async () => {
    if (currentLineIndex >= dialogueScript.length) {
      // Диалог завершен
      setIsDialogueFinished(true);
      setIsPlaying(false);
      setCurrentSpeaker(null);
      onDialogueFinished?.();
      return;
    }

    const currentLine = dialogueScript[currentLineIndex];
    setCurrentSpeaker(currentLine.speaker);

    try {
      if (apiKey) {
        // Используем D-ID API для создания говорящего аватара
        await createTalkingAvatar(currentLine);
      } else {
        // Fallback к Web Speech API
        await speakWithWebSpeech(currentLine);
      }

      // Ждем завершения реплики, затем переходим к следующей
      timeoutRef.current = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        playNextLine();
      }, currentLine.duration);

    } catch (error) {
      console.error('Error playing dialogue line:', error);
      onError?.(error as Error);
    }
  };

  const createTalkingAvatar = async (line: DialogueLine) => {
    try {
      console.log('Creating D-ID talk with:', {
        text: line.text,
        voice: line.voice,
        speaker: line.speaker,
        apiKey: apiKey ? 'Present' : 'Missing'
      });

      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: line.text,
            provider: {
              type: 'microsoft',
              voice_id: line.voice
            }
          },
          source_url: 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg',
          config: {
            fluent: true,
            pad_audio: 0.0
          }
        })
      });

      console.log('D-ID API Response Status:', response.status);
      const data = await response.json();
      console.log('D-ID API Response Data:', data);

      if (response.ok && data.id) {
        const talkId = data.id;
        console.log('D-ID Talk created successfully:', talkId);
        
        // Polling для получения готового видео
        const pollForCompletion = async () => {
          const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
            headers: {
              'Authorization': `Basic ${apiKey}`,
            }
          });
          const statusData = await statusResponse.json();
          console.log('D-ID Status check:', statusData);
          
          if (statusData.status === 'done' && statusData.result_url) {
            const videoElement = line.speaker === 'john' ? johnVideoRef.current : aiVideoRef.current;
            if (videoElement) {
              videoElement.src = statusData.result_url;
              videoElement.load();
              videoElement.play().catch(e => console.error("Error playing video:", e));
            }
          } else if (statusData.status === 'failed') {
            throw new Error(statusData.error || 'D-ID video generation failed.');
          } else {
            // Продолжаем polling
            setTimeout(pollForCompletion, 1000);
          }
        };
        
        pollForCompletion();
      } else if (response.status === 402) {
        // Недостаточно кредитов - используем Web Speech API
        console.warn('D-ID API: Insufficient credits, falling back to Web Speech API');
        setIsUsingFallback(true);
        await speakWithWebSpeech(line);
      } else {
        console.error('D-ID API Error:', data);
        throw new Error(data.error || 'Failed to create D-ID talk.');
      }
    } catch (error) {
      console.error('D-ID API error:', error);
      // Fallback к Web Speech API
      await speakWithWebSpeech(line);
    }
  };

  const speakWithWebSpeech = async (line: DialogueLine) => {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      utterance.pitch = line.speaker === 'john' ? 0.8 : 1.0;
      utterance.volume = isMuted ? 0 : 0.8;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      speechSynthesis.speak(utterance);
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (johnVideoRef.current) johnVideoRef.current.muted = !johnVideoRef.current.muted;
    if (aiVideoRef.current) aiVideoRef.current.muted = !aiVideoRef.current.muted;
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col">
      {/* Диалог между аватарами */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* John Smith - Мужчина слева */}
        <div className="relative bg-gray-900 rounded-2xl flex flex-col items-center justify-center">
          <video
            ref={johnVideoRef}
            className="w-full h-full object-contain p-4"
            autoPlay
            playsInline
            muted={isMuted}
            loop={false}
          />
          <div className="absolute top-4 left-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                currentSpeaker === 'john' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`} />
              <span className="text-white text-sm font-semibold">John Smith</span>
            </div>
          </div>
          {currentSpeaker === 'john' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2">
                <MessageSquareText className="w-4 h-4 text-green-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant - Женщина справа */}
        <div className="relative bg-gray-900 rounded-2xl flex flex-col items-center justify-center">
          <video
            ref={aiVideoRef}
            className="w-full h-full object-contain p-4"
            autoPlay
            playsInline
            muted={isMuted}
            loop={false}
          />
          <div className="absolute top-4 left-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                currentSpeaker === 'ai' ? 'bg-purple-500 animate-pulse' : 'bg-gray-500'
              }`} />
              <span className="text-white text-sm font-semibold">Shadow AI</span>
            </div>
          </div>
          {currentSpeaker === 'ai' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-2">
                <MessageSquareText className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Текущий текст диалога */}
      {currentSpeaker && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-3 max-w-md">
            <p className="text-white text-sm text-center">
              {dialogueScript[currentLineIndex]?.text}
            </p>
            {isUsingFallback && (
              <p className="text-yellow-400 text-xs text-center mt-2">
                🔊 Используется Web Speech API (D-ID кредиты закончились)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-full backdrop-blur-sm">
        <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        
        {isPlaying && (
          <Button size="sm" disabled className="bg-blue-600 text-white">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Диалог в процессе...
          </Button>
        )}

        {isDialogueFinished && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Mic className="w-4 h-4 mr-2" />
            Готов к разговору!
          </Button>
        )}
      </div>

      {/* Loading State */}
      {!isPlaying && !isDialogueFinished && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-white z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Подготовка диалога...</p>
          </div>
        </div>
      )}
    </div>
  );
};
