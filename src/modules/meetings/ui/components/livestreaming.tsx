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
  const [livestreamId, setLivestreamId] = useState<string | null>(null);
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
      // Обновляем только длительность стрима (реальные данные)
      const startTime = Date.now();
      setStats(prev => ({ ...prev, startTime: startTime }));
      
      const interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          duration: formatDuration(Date.now() - (prev.startTime || Date.now())),
        }));
      }, 1000);

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

      // Use Stream Backend API to start livestream
      const response = await fetch('/api/stream/livestream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: call.id,
          rtmpUrl: undefined, // Optional: provide custom RTMP URL
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start livestream');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start livestream');
      }
      
      // Store stream information
      setStreamUrl(data.playbackUrl || data.hlsUrl || data.rtmpUrl || '');
      setStreamKey(data.streamKey || '');
      setLivestreamId(data.livestreamId);
      setIsStreaming(true);
      
      // Reset start time for duration tracking
      setStats(prev => ({ 
        ...prev, 
        startTime: Date.now(),
        duration: '00:00:00'
      }));
      
      toast.success('Livestream started successfully');
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start livestream');
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    setIsLoading(true);
    try {
      if (!call || !livestreamId) {
        setIsStreaming(false);
        return;
      }

      // Use Stream Backend API to stop livestream
      const response = await fetch(`/api/stream/livestream?livestreamId=${livestreamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to stop livestream');
      }

      setIsStreaming(false);
      setStreamUrl("");
      setStreamKey("");
      setLivestreamId(null);
      setStats({
        viewers: 0,
        duration: "00:00:00",
        quality: '1080p',
        bitrate: 2500,
        fps: 30
      });
      toast.success('Livestream stopped');
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Failed to stop livestream');
    } finally {
      setIsLoading(false);
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
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-white/5 p-2 rounded">
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-3 h-3 text-green-400" />
                  <span className="text-gray-400">Duration</span>
                </div>
                <p className="text-white font-medium">{stats.duration}</p>
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
