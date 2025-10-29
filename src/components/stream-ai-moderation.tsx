"use client";

import { useEffect, useState } from 'react';
import { useCall } from '@stream-io/video-react-sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Settings, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface StreamAIModerationProps {
  callId: string;
  isEnabled: boolean;
  onToggle: () => void;
}

interface ModerationEvent {
  id: string;
  type: 'warning' | 'block' | 'approve';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  action: 'flagged' | 'blocked' | 'approved';
}

export function StreamAIModeration({ callId, isEnabled, onToggle }: StreamAIModerationProps) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [moderationEvents, setModerationEvents] = useState<ModerationEvent[]>([]);
  const [moderationConfig, setModerationConfig] = useState({
    enabled: true,
    autoBlock: false,
    sensitivity: 'medium' as 'low' | 'medium' | 'high',
    categories: {
      toxicity: true,
      harassment: true,
      spam: true,
      inappropriate: true
    }
  });
  const call = useCall();

  useEffect(() => {
    if (isEnabled && call) {
      initializeAIModeration();
    }
  }, [isEnabled, call]);

  const initializeAIModeration = async () => {
    try {
      setIsLoading(true);
      
      // Реальная интеграция с Stream AI Moderation
      const moderation = await call.enableAIModeration({
        autoBlock: moderationConfig.autoBlock,
        sensitivity: moderationConfig.sensitivity,
        categories: moderationConfig.categories,
        onModerationEvent: (event) => {
          const moderationEvent: ModerationEvent = {
            id: event.id || Date.now().toString(),
            type: event.action === 'blocked' ? 'block' : event.action === 'flagged' ? 'warning' : 'approve',
            message: event.message || 'Content moderated',
            timestamp: new Date(event.timestamp || Date.now()),
            severity: event.severity || 'medium',
            action: event.action || 'flagged'
          };
          
          setModerationEvents(prev => [moderationEvent, ...prev.slice(0, 19)]);
          
          // Показываем уведомление
          if (event.action === 'blocked') {
            toast.error('Content blocked by AI Moderation');
          } else if (event.action === 'flagged') {
            toast.warning('Content flagged for review');
          }
        },
        onError: (error) => {
          console.error('AI Moderation error:', error);
          toast.error('AI Moderation error occurred');
        }
      });

      // Сохраняем ссылку для управления
      (window as any).streamAIModeration = moderation;
      setIsActive(true);
      toast.success('AI Moderation activated');
    } catch (error) {
      console.error('Error initializing AI Moderation:', error);
      toast.error('Failed to initialize AI Moderation');
    } finally {
      setIsLoading(false);
    }
  };

  const stopAIModeration = async () => {
    try {
      if ((window as any).streamAIModeration) {
        await (window as any).streamAIModeration.disable();
        delete (window as any).streamAIModeration;
      }
      setIsActive(false);
      toast.success('AI Moderation deactivated');
    } catch (error) {
      console.error('Error stopping AI Moderation:', error);
      toast.error('Failed to stop AI Moderation');
    }
  };

  const updateModerationConfig = (newConfig: Partial<typeof moderationConfig>) => {
    setModerationConfig(prev => ({ ...prev, ...newConfig }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'block': return <Shield className="w-4 h-4 text-red-400" />;
      case 'approve': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400';
      case 'block': return 'bg-red-500/20 border-red-400/30 text-red-400';
      case 'approve': return 'bg-green-500/20 border-green-400/30 text-green-400';
      default: return 'bg-gray-500/20 border-gray-400/30 text-gray-400';
    }
  };

  if (!isEnabled) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-white">
            <Shield className="w-5 h-5" />
            AI Moderation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-400 mb-4">Enable AI Moderation for automatic content filtering</p>
          <Button onClick={onToggle} className="w-full">
            Enable AI Moderation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Moderation
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Configuration */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Configuration</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Auto Block</span>
              <Button
                size="sm"
                variant={moderationConfig.autoBlock ? "default" : "outline"}
                onClick={() => updateModerationConfig({ autoBlock: !moderationConfig.autoBlock })}
                disabled={isActive}
              >
                {moderationConfig.autoBlock ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
            
            <div>
              <label className="text-sm text-gray-300">Sensitivity</label>
              <select
                value={moderationConfig.sensitivity}
                onChange={(e) => updateModerationConfig({ sensitivity: e.target.value as any })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm mt-1"
                disabled={isActive}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-300">Categories</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {Object.entries(moderationConfig.categories).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateModerationConfig({
                        categories: { ...moderationConfig.categories, [key]: e.target.checked }
                      })}
                      disabled={isActive}
                      className="rounded"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button
              onClick={initializeAIModeration}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start AI Moderation
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={stopAIModeration}
              variant="destructive"
              className="flex-1"
            >
              <Shield className="w-4 h-4 mr-2" />
              Stop AI Moderation
            </Button>
          )}
          
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Moderation Events */}
        {isActive && moderationEvents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Recent Events</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {moderationEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-2 p-2 rounded text-xs ${getEventColor(event.type)}`}
                >
                  {getEventIcon(event.type)}
                  <span className="flex-1 truncate">{event.message}</span>
                  <span className="text-xs opacity-70">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {isActive && (
          <div className="bg-blue-500/20 border border-blue-400/30 rounded p-3">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              AI Moderation is actively monitoring content
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
