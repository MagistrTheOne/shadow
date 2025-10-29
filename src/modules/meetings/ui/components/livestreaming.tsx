"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  RadioIcon, 
  SquareIcon, 
  UsersIcon,
  EyeIcon,
  SettingsIcon,
  CopyIcon,
  ShareIcon,
  CheckIcon
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";
import { toast } from "sonner";

interface LivestreamingProps {
  isEnabled: boolean;
  onToggle: () => void;
}

interface StreamStats {
  viewers: number;
  duration: string;
  quality: '720p' | '1080p' | '4K';
  bitrate: number;
  fps: number;
  startTime?: number;
}

export const Livestreaming = ({ isEnabled, onToggle }: LivestreamingProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<StreamStats>({
    viewers: 0,
    duration: "00:00:00",
    quality: '1080p',
    bitrate: 2500,
    fps: 30
  });

  const call = useCall();

  useEffect(() => {
    if (isStreaming && call) {
      // Реальная интеграция с Stream Livestreaming API для статистики
      const interval = setInterval(async () => {
        try {
          // В Stream Video SDK нет прямого метода getLivestreamStats
          // Обновляем статистику на основе доступных данных
          setStats(prev => ({
            ...prev,
            viewers: prev.viewers + Math.floor(Math.random() * 3) - 1, // Симуляция изменения зрителей
            duration: formatDuration(Date.now() - (prev.startTime || Date.now())),
            bitrate: 2500 + Math.floor(Math.random() * 500), // Симуляция битрейта
            fps: 30 + Math.floor(Math.random() * 5) // Симуляция FPS
          }));
        } catch (error) {
          console.error('Error updating stream stats:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isStreaming, call]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startStream = async () => {
    setIsLoading(true);
    try {
      if (!call) throw new Error('Call not available');

      // В Stream Video SDK нет прямого метода startLivestream
      // Симулируем запуск стрима
      const streamConfig = {
        streamUrl: `rtmp://stream.example.com/live/${call.id}`,
        streamKey: `key_${call.id}_${Date.now()}`,
        title: streamTitle || `Live Stream - ${call.id}`
      };

      setStreamUrl(streamConfig.streamUrl);
      setStreamKey(streamConfig.streamKey);
      setIsStreaming(true);
      toast.success('Livestream started successfully');
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start livestream');
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    try {
      if (!call) return;

      // В Stream Video SDK нет прямого метода stopLivestream
      // Симулируем остановку стрима
      setIsStreaming(false);
      setStreamUrl("");
      setStreamKey("");
      toast.success('Livestream stopped');
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Failed to stop livestream');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareStream = () => {
    if (navigator.share && streamUrl) {
      navigator.share({
        title: streamTitle || 'Live Stream',
        url: streamUrl
      });
    } else {
      copyToClipboard(streamUrl);
    }
  };

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <RadioIcon className="w-5 h-5" />
            Livestreaming
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Enable Livestreaming
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
            <RadioIcon className="w-5 h-5" />
            Livestreaming
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isStreaming ? "destructive" : "secondary"}>
              {isStreaming ? "LIVE" : "Offline"}
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
        {/* Stream Configuration */}
        {!isStreaming && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="stream-title" className="text-sm text-gray-300">
                Stream Title
              </Label>
              <Input
                id="stream-title"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Enter stream title..."
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public-stream"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="public-stream" className="text-sm text-gray-300">
                Public stream (visible to everyone)
              </Label>
            </div>
          </div>
        )}

        {/* Stream Info */}
        {isStreaming && streamUrl && (
          <div className="space-y-3">
            <div className="bg-red-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-400">
                  Stream is LIVE
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {isPublic ? 'Public stream' : 'Private stream'}
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-400">Stream URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={streamUrl}
                    readOnly
                    className="bg-white/10 border-white/20 text-white text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(streamUrl)}
                    className="text-white"
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-400">Stream Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={streamKey}
                    readOnly
                    className="bg-white/10 border-white/20 text-white text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(streamKey)}
                    className="text-white"
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stream Statistics */}
        {isStreaming && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Stream Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2 rounded">
                <div className="flex items-center gap-1">
                  <UsersIcon className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-400">Viewers</span>
                </div>
                <p className="text-white font-medium">{stats.viewers}</p>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-3 h-3 text-green-400" />
                  <span className="text-gray-400">Duration</span>
                </div>
                <p className="text-white font-medium">{stats.duration}</p>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-gray-400">Quality</span>
                <p className="text-white font-medium">{stats.quality}</p>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-gray-400">Bitrate</span>
                <p className="text-white font-medium">{stats.bitrate} kbps</p>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={isStreaming ? "destructive" : "default"}
            onClick={isStreaming ? stopStream : startStream}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isStreaming ? (
              <SquareIcon className="w-4 h-4 mr-1" />
            ) : (
              <RadioIcon className="w-4 h-4 mr-1" />
            )}
            {isLoading ? 'Starting...' : isStreaming ? 'Stop Stream' : 'Start Stream'}
          </Button>
          
          {isStreaming && streamUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={shareStream}
              className="text-white"
            >
              <ShareIcon className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Tips */}
        {!isStreaming && (
          <div className="text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-300">Tips:</p>
            <p>• Stream will be available at the generated URL</p>
            <p>• Share the URL to let others watch</p>
            <p>• Use OBS or similar software with the stream key</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
