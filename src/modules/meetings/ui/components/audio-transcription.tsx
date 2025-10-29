"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MicIcon, 
  MicOffIcon, 
  DownloadIcon, 
  CopyIcon,
  CheckIcon,
  ClockIcon,
  UserIcon
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";
import { format } from "date-fns";

interface AudioTranscriptionProps {
  isEnabled: boolean;
  onToggle: () => void;
}

interface TranscriptionEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  confidence: number;
}

export const AudioTranscription = ({ isEnabled, onToggle }: AudioTranscriptionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const call = useCall();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Моковые данные для демонстрации
  const mockTranscriptions: TranscriptionEntry[] = [
    {
      id: '1',
      speaker: 'John Smith',
      text: 'Привет всем, как дела с проектом?',
      timestamp: new Date(Date.now() - 300000),
      confidence: 0.95
    },
    {
      id: '2',
      speaker: 'AI Assistant',
      text: 'Проект идет по плану. Все задачи выполнены на 80%.',
      timestamp: new Date(Date.now() - 240000),
      confidence: 0.98
    },
    {
      id: '3',
      speaker: 'Jane Doe',
      text: 'Отлично! Когда планируем релиз?',
      timestamp: new Date(Date.now() - 180000),
      confidence: 0.92
    },
    {
      id: '4',
      speaker: 'AI Assistant',
      text: 'Релиз запланирован на следующую пятницу.',
      timestamp: new Date(Date.now() - 120000),
      confidence: 0.99
    }
  ];

  useEffect(() => {
    if (isEnabled && call) {
      // Реальная интеграция с Stream Audio Transcription
      const initializeTranscription = async () => {
        try {
          // Подключаемся к Stream Audio Transcription
          const transcription = await call.enableAudioTranscription({
            language: 'auto', // Автоопределение языка
            onTranscription: (entry) => {
              const newEntry: TranscriptionEntry = {
                id: entry.id || Date.now().toString(),
                speaker: entry.speaker || 'Unknown',
                text: entry.text || '',
                timestamp: new Date(entry.timestamp || Date.now()),
                confidence: entry.confidence || 0.8
              };
              
              setTranscriptions(prev => [...prev, newEntry]);
            }
          });

          // Сохраняем ссылку для управления
          (window as any).streamTranscription = transcription;
        } catch (error) {
          console.error('Error initializing transcription:', error);
          toast.error('Failed to initialize transcription');
        }
      };

      initializeTranscription();
    }
  }, [isEnabled, call]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const startTranscription = async () => {
    setIsLoading(true);
    try {
      if (!call) throw new Error('Call not available');

      // Реальная инициализация Stream Audio Transcription
      const transcription = await call.enableAudioTranscription({
        language: 'auto',
        onTranscription: (entry) => {
          const newEntry: TranscriptionEntry = {
            id: entry.id || Date.now().toString(),
            speaker: entry.speaker || 'Unknown',
            text: entry.text || '',
            timestamp: new Date(entry.timestamp || Date.now()),
            confidence: entry.confidence || 0.8
          };
          
          setTranscriptions(prev => [...prev, newEntry]);
        }
      });

      // Сохраняем ссылку для управления
      (window as any).streamTranscription = transcription;
      setIsRecording(true);
      toast.success('Transcription started');
    } catch (error) {
      console.error('Error starting transcription:', error);
      toast.error('Failed to start transcription');
    } finally {
      setIsLoading(false);
    }
  };

  const stopTranscription = async () => {
    try {
      if (!call) return;

      // Останавливаем Stream Audio Transcription
      if ((window as any).streamTranscription) {
        await (window as any).streamTranscription.disable();
        delete (window as any).streamTranscription;
      }
      
      setIsRecording(false);
      toast.success('Transcription stopped');
    } catch (error) {
      console.error('Error stopping transcription:', error);
      toast.error('Failed to stop transcription');
    }
  };

  const downloadTranscription = () => {
    const text = transcriptions
      .map(t => `[${format(t.timestamp, 'HH:mm:ss')}] ${t.speaker}: ${t.text}`)
      .join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <MicIcon className="w-5 h-5" />
            Audio Transcription
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Enable Transcription
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <MicIcon className="w-5 h-5" />
            Live Transcription
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isRecording ? "destructive" : "secondary"}>
              {isRecording ? "Recording" : "Stopped"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggle}
              className="text-white"
            >
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopTranscription : startTranscription}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRecording ? (
              <MicOffIcon className="w-4 h-4 mr-1" />
            ) : (
              <MicIcon className="w-4 h-4 mr-1" />
            )}
            {isLoading ? 'Starting...' : isRecording ? 'Stop' : 'Start'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={downloadTranscription}
            disabled={transcriptions.length === 0}
            className="text-white"
          >
            <DownloadIcon className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="h-64 w-full">
          <div ref={scrollRef} className="space-y-3 pr-4">
            {transcriptions.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">
                      {entry.speaker}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(entry.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs ${getConfidenceColor(entry.confidence)}`}>
                      {Math.round(entry.confidence * 100)}%
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(entry.text, entry.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      {copiedId === entry.id ? (
                        <CheckIcon className="w-3 h-3" />
                      ) : (
                        <CopyIcon className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-300 pl-6">
                  {entry.text}
                </p>
              </div>
            ))}
            
            {transcriptions.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <MicIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No transcription yet</p>
                <p className="text-xs">Start recording to see live transcription</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {isRecording && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Listening for speech...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
