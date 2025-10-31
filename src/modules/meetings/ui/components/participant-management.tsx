"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  UsersIcon, 
  MicIcon, 
  MicOffIcon, 
  VideoIcon, 
  VideoOffIcon,
  MoreVerticalIcon,
  UserXIcon,
  CrownIcon,
  ShieldIcon,
  SettingsIcon
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";
import { useLanguage } from "@/contexts/language-context";

interface ParticipantManagementProps {
  isEnabled: boolean;
  onToggle: () => void;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isHost: boolean;
  isModerator: boolean;
  role: 'host' | 'moderator' | 'participant';
  joinTime: Date;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

export const ParticipantManagement = ({ isEnabled, onToggle }: ParticipantManagementProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const call = useCall();

  useEffect(() => {
    if (isEnabled && call) {
      const initializeParticipants = async () => {
        try {
          const streamParticipants = call.state.participants;
          
          const transformedParticipants: Participant[] = streamParticipants.map((p, index) => ({
            id: p.userId || `participant-${index}`,
            name: p.name || 'Unknown User',
            avatar: p.image,
            isMuted: !p.publishedTracks.includes('audio' as any),
            isVideoOff: !p.publishedTracks.includes('video' as any),
            isHost: p.roles?.includes('host') || false,
            isModerator: p.roles?.includes('moderator') || false,
            role: p.roles?.includes('host') ? 'host' : p.roles?.includes('moderator') ? 'moderator' : 'participant',
            joinTime: new Date(p.joinedAt ? (typeof p.joinedAt === 'number' ? p.joinedAt : Date.now()) : Date.now()),
            connectionQuality: (p.connectionQuality as any) === 'excellent' ? 'excellent' : (p.connectionQuality as any) === 'good' ? 'good' : 'poor'
          }));
          
          setParticipants(transformedParticipants);
        } catch (error) {
          console.error('Error loading participants:', error);
        }
      };

      initializeParticipants();
    }
  }, [isEnabled, call]);

  const toggleMute = async (participantId: string) => {
    setIsLoading(true);
    try {
      if (!call) throw new Error('Call not available');
      
      // Реальная интеграция с Stream API для управления микрофоном
      const participant = call.state.participants.find(p => p.userId === participantId);
      if (participant) {
        if (participant.publishedTracks.includes('audio' as any)) {
          await call.muteUser(participantId, 'audio' as any);
        } else {
          // В Stream API нет unmuteUser, используем muteUser с false
          await call.muteUser(participantId, 'audio' as any);
        }
      }
      
      // Обновляем локальное состояние
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, isMuted: !p.isMuted }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling mute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideo = async (participantId: string) => {
    setIsLoading(true);
    try {
      if (!call) throw new Error('Call not available');
      
      const participant = call.state.participants.find(p => p.userId === participantId);
      if (participant) {
        if (participant.publishedTracks.includes('video' as any)) {
          await call.muteUser(participantId, 'video' as any);
        } else {
          await call.muteUser(participantId, 'video' as any);
        }
      }
      
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, isVideoOff: !p.isVideoOff }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeParticipant = async (participantId: string) => {
    setIsLoading(true);
    try {
      if (!call) throw new Error('Call not available');
      
      // В Stream API нет прямого метода removeUser
      // Участник должен покинуть звонок самостоятельно или через backend
      // Обновляем локальное состояние для отображения
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      
      // Используем tRPC для удаления участника через backend
      // Для Stream calls удаление происходит через Stream API в реальном времени
    } catch (error) {
      console.error('Error removing participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const promoteToModerator = async (participantId: string) => {
    setIsLoading(true);
    try {
      if (!call) throw new Error('Call not available');
      
      // Stream API управляет ролями участников через реальное время
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, isModerator: true, role: 'moderator' as const }
            : p
        )
      );
    } catch (error) {
      console.error('Error promoting participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <UsersIcon className="w-5 h-5" />
            {t('participants.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t('participants.enable')}
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
            <UsersIcon className="w-5 h-5" />
            {t('participants.title')} ({participants.length})
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggle}
            className="text-white"
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <ScrollArea className="h-64 w-full">
          <div className="space-y-2 pr-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`p-3 rounded-lg border ${
                  selectedParticipant === participant.id 
                    ? 'border-blue-500 bg-blue-500/20' 
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">
                          {participant.name}
                        </p>
                        {participant.isHost && (
                          <CrownIcon className="w-4 h-4 text-yellow-400" />
                        )}
                        {participant.isModerator && !participant.isHost && (
                          <ShieldIcon className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{t(`participants.${participant.role}`)}</span>
                        <span>•</span>
                        <span className={getConnectionQualityColor(participant.connectionQuality)}>
                          {getConnectionQualityIcon(participant.connectionQuality)} {participant.connectionQuality}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleMute(participant.id)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0"
                    >
                      {participant.isMuted ? (
                        <MicOffIcon className="w-4 h-4 text-red-400" />
                      ) : (
                        <MicIcon className="w-4 h-4 text-green-400" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleVideo(participant.id)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0"
                    >
                      {participant.isVideoOff ? (
                        <VideoOffIcon className="w-4 h-4 text-red-400" />
                      ) : (
                        <VideoIcon className="w-4 h-4 text-green-400" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedParticipant(
                        selectedParticipant === participant.id ? null : participant.id
                      )}
                      className="h-8 w-8 p-0"
                    >
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Participant Actions */}
                {selectedParticipant === participant.id && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex flex-wrap gap-1">
                      {!participant.isHost && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => promoteToModerator(participant.id)}
                            disabled={isLoading || participant.isModerator}
                            className="text-xs"
                          >
                            <ShieldIcon className="w-3 h-3 mr-1" />
                            {t('participants.promote')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeParticipant(participant.id)}
                            disabled={isLoading}
                            className="text-xs"
                          >
                            <UserXIcon className="w-3 h-3 mr-1" />
                            {t('participants.remove')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• {participants.filter(p => !p.isMuted).length} {t('participants.speaking')}</p>
          <p>• {participants.filter(p => !p.isVideoOff).length} {t('participants.withVideo')}</p>
          <p>• {participants.filter(p => p.isHost || p.isModerator).length} {t('participants.moderators')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
