"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MonitorIcon, 
  MonitorOffIcon, 
  ShareIcon,
  StopCircleIcon,
  SettingsIcon,
  UsersIcon
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";
import { toast } from "sonner";

interface ScreenSharingProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const ScreenSharing = ({ isEnabled, onToggle }: ScreenSharingProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sharingType, setSharingType] = useState<'screen' | 'window' | 'tab'>('screen');
  const [participants, setParticipants] = useState(0);

  const call = useCall();

  const sharingOptions = [
    { id: 'screen', name: 'Entire Screen', icon: MonitorIcon },
    { id: 'window', name: 'Application Window', icon: ShareIcon },
    { id: 'tab', name: 'Browser Tab', icon: MonitorIcon },
  ] as const;

  useEffect(() => {
    if (call) {
      const unsubscribe = call.on('call.updated', (event) => {
        setParticipants(call.state.participants?.length || 0);
      });

      setParticipants(call.state.participants?.length || 0);

      return () => {
        unsubscribe();
      };
    }
  }, [call]);

  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);

  const startScreenShare = async () => {
    setIsLoading(true);
    try {
      if (!call) throw new Error('Call not available');

      // Получаем screen share stream через браузерный API
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Stream Video SDK автоматически обрабатывает screen sharing
      // Сохраняем stream для последующей остановки
      setScreenShareStream(stream);

      // Останавливаем stream при завершении пользователем
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setIsSharing(false);
        setScreenShareStream(null);
      });

      setIsSharing(true);
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
    } finally {
      setIsLoading(false);
    }
  };

  const stopScreenShare = async () => {
    try {
      if (!call) return;

      // Останавливаем screen share stream
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });
        setScreenShareStream(null);
      }
      
      setIsSharing(false);
      toast.success('Screen sharing stopped');
    } catch (error) {
      console.error('Error stopping screen share:', error);
      toast.error('Failed to stop screen sharing');
    }
  };

  const handleSharingTypeChange = (type: 'screen' | 'window' | 'tab') => {
    setSharingType(type);
  };

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <MonitorIcon className="w-5 h-5" />
            Screen Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Enable Screen Sharing
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
            <MonitorIcon className="w-5 h-5" />
            Screen Sharing
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isSharing ? "destructive" : "secondary"}>
              {isSharing ? "Sharing" : "Not Sharing"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <UsersIcon className="w-3 h-3 mr-1" />
              {participants}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Sharing Type Selection */}
        {!isSharing && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">What would you like to share?</h4>
            <div className="space-y-2">
              {sharingOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = sharingType === option.id;
                
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSharingTypeChange(option.id as any)}
                    className={`w-full justify-start ${
                      isSelected 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {option.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={isSharing ? "destructive" : "default"}
            onClick={isSharing ? stopScreenShare : startScreenShare}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSharing ? (
              <StopCircleIcon className="w-4 h-4 mr-1" />
            ) : (
              <MonitorIcon className="w-4 h-4 mr-1" />
            )}
            {isLoading ? 'Starting...' : isSharing ? 'Stop Sharing' : 'Start Sharing'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onToggle}
            className="text-white"
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Sharing Status */}
        {isSharing && (
          <div className="space-y-2">
            <div className="bg-cyan-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-cyan-400">
                  Currently sharing {sharingType}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {participants} participant{participants !== 1 ? 's' : ''} can see your screen
              </p>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>• Click "Stop Sharing" to end the presentation</p>
              <p>• Your screen is being recorded</p>
              <p>• Use Alt+Tab to switch between applications</p>
            </div>
          </div>
        )}

        {/* Tips */}
        {!isSharing && (
          <div className="text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-300">Tips:</p>
            <p>• Close sensitive applications before sharing</p>
            <p>• Use "Application Window" for better performance</p>
            <p>• Browser tab sharing works best for presentations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
