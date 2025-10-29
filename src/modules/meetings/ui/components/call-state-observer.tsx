"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ActivityIcon, 
  UsersIcon, 
  MicIcon, 
  VideoIcon, 
  WifiIcon,
  ClockIcon,
  SettingsIcon,
  PlayIcon,
  PauseIcon,
  SquareIcon
} from "lucide-react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";

interface CallStateObserverProps {
  isEnabled: boolean;
  onToggle: () => void;
}

interface CallEvent {
  id: string;
  type: 'participant_joined' | 'participant_left' | 'mute_changed' | 'video_changed' | 'call_started' | 'call_ended' | 'recording_started' | 'recording_stopped';
  participant?: string;
  timestamp: Date;
  details: string;
}

interface CallStats {
  duration: string;
  participants: number;
  audioQuality: 'excellent' | 'good' | 'poor';
  videoQuality: 'excellent' | 'good' | 'poor';
  bandwidth: number;
  packetLoss: number;
  jitter: number;
}

export const CallStateObserver = ({ isEnabled, onToggle }: CallStateObserverProps) => {
  const [events, setEvents] = useState<CallEvent[]>([]);
  const [stats, setStats] = useState<CallStats>({
    duration: "00:00:00",
    participants: 0,
    audioQuality: 'excellent',
    videoQuality: 'excellent',
    bandwidth: 0,
    packetLoss: 0,
    jitter: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const call = useCall();
  const { useCallCallingState, useParticipants, useCallRecordingState } = useCallStateHooks();
  
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const recordingState = useCallRecordingState();

  // Моковые данные для демонстрации
  const mockEvents: CallEvent[] = [
    {
      id: '1',
      type: 'call_started',
      timestamp: new Date(Date.now() - 300000),
      details: 'Call started by John Smith'
    },
    {
      id: '2',
      type: 'participant_joined',
      participant: 'Jane Doe',
      timestamp: new Date(Date.now() - 240000),
      details: 'Jane Doe joined the call'
    },
    {
      id: '3',
      type: 'participant_joined',
      participant: 'AI Assistant',
      timestamp: new Date(Date.now() - 180000),
      details: 'AI Assistant joined the call'
    },
    {
      id: '4',
      type: 'mute_changed',
      participant: 'Jane Doe',
      timestamp: new Date(Date.now() - 120000),
      details: 'Jane Doe muted their microphone'
    },
    {
      id: '5',
      type: 'video_changed',
      participant: 'AI Assistant',
      timestamp: new Date(Date.now() - 60000),
      details: 'AI Assistant turned off their camera'
    }
  ];

  useEffect(() => {
    if (isEnabled && call) {
      // Реальная интеграция с Stream Call State Observer
      const initializeCallObserver = async () => {
        try {
          // Подписываемся на события звонка
          const unsubscribe = call.on('call.updated', (event) => {
            const newEvent: CallEvent = {
              id: event.id || Date.now().toString(),
              type: event.type || 'call_updated',
              timestamp: new Date(event.timestamp || Date.now()),
              details: event.details || 'Call state updated',
              participant: event.participant || 'System'
            };
            
            setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep last 20 events
          });

          // Подписываемся на статистику звонка
          const statsUnsubscribe = call.on('call.stats', (stats) => {
            setStats({
              duration: formatDuration(stats.duration || 0),
              participants: stats.participants || participants.length,
              bandwidth: stats.bandwidth || 0,
              packetLoss: stats.packetLoss || 0,
              jitter: stats.jitter || 0
            });
          });

          // Сохраняем функции отписки
          (window as any).callObserverUnsubscribe = unsubscribe;
          (window as any).callStatsUnsubscribe = statsUnsubscribe;
        } catch (error) {
          console.error('Error initializing call observer:', error);
          toast.error('Failed to initialize call observer');
        }
      };

      initializeCallObserver();

      return () => {
        // Очищаем подписки при размонтировании
        if ((window as any).callObserverUnsubscribe) {
          (window as any).callObserverUnsubscribe();
        }
        if ((window as any).callStatsUnsubscribe) {
          (window as any).callStatsUnsubscribe();
        }
      };
    }
  }, [isEnabled, call, participants.length]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'participant_joined': return <UsersIcon className="w-4 h-4 text-green-400" />;
      case 'participant_left': return <UsersIcon className="w-4 h-4 text-red-400" />;
      case 'mute_changed': return <MicIcon className="w-4 h-4 text-yellow-400" />;
      case 'video_changed': return <VideoIcon className="w-4 h-4 text-blue-400" />;
      case 'call_started': return <PlayIcon className="w-4 h-4 text-green-400" />;
      case 'call_ended': return <SquareIcon className="w-4 h-4 text-red-400" />;
      case 'recording_started': return <PlayIcon className="w-4 h-4 text-red-400" />;
      case 'recording_stopped': return <PauseIcon className="w-4 h-4 text-gray-400" />;
      default: return <ActivityIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'participant_joined': return 'border-green-500 bg-green-500/20';
      case 'participant_left': return 'border-red-500 bg-red-500/20';
      case 'mute_changed': return 'border-yellow-500 bg-yellow-500/20';
      case 'video_changed': return 'border-blue-500 bg-blue-500/20';
      case 'call_started': return 'border-green-600 bg-green-600/20';
      case 'call_ended': return 'border-red-600 bg-red-600/20';
      case 'recording_started': return 'border-red-500 bg-red-500/20';
      case 'recording_stopped': return 'border-gray-500 bg-gray-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <ActivityIcon className="w-5 h-5" />
            Call State Observer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            Enable Call State Observer
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
            <ActivityIcon className="w-5 h-5" />
            Call State Observer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-teal-600">
              Active
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggle}
              className="text-white"
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Call Statistics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Call Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 p-2 rounded">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3 text-blue-400" />
                <span className="text-gray-400">Duration</span>
              </div>
              <p className="text-white font-medium">{stats.duration}</p>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <div className="flex items-center gap-1">
                <UsersIcon className="w-3 h-3 text-green-400" />
                <span className="text-gray-400">Participants</span>
              </div>
              <p className="text-white font-medium">{stats.participants}</p>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <div className="flex items-center gap-1">
                <MicIcon className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400">Audio</span>
              </div>
              <p className={`font-medium ${getQualityColor(stats.audioQuality)}`}>
                {stats.audioQuality}
              </p>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <div className="flex items-center gap-1">
                <VideoIcon className="w-3 h-3 text-cyan-400" />
                <span className="text-gray-400">Video</span>
              </div>
              <p className={`font-medium ${getQualityColor(stats.videoQuality)}`}>
                {stats.videoQuality}
              </p>
            </div>
          </div>
        </div>

        {/* Network Statistics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Network Statistics</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Bandwidth</span>
              <span className="text-white">{stats.bandwidth} kbps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Packet Loss</span>
              <span className="text-white">{stats.packetLoss.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jitter</span>
              <span className="text-white">{stats.jitter.toFixed(1)} ms</span>
            </div>
          </div>
        </div>

        {/* Call Events */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Call Events</h4>
          <ScrollArea className="h-48 w-full">
            <div className="space-y-2 pr-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-2 rounded-lg border ${getEventColor(event.type)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getEventIcon(event.type)}
                    <span className="text-sm font-medium text-white">
                      {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-xs text-gray-400">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    {event.participant && `${event.participant}: `}{event.details}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Call State */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Call State</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {callingState}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Recording</span>
              <Badge variant="outline" className={recordingState ? "text-red-400 border-red-400" : "text-gray-400 border-gray-400"}>
                {recordingState ? "Recording" : "Not Recording"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
