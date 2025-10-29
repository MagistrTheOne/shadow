"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShieldIcon, 
  UsersIcon, 
  MicIcon, 
  VideoIcon, 
  MessageSquareIcon,
  SettingsIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CrownIcon
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";

interface AdvancedPermissionsProps {
  isEnabled: boolean;
  onToggle: () => void;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'audio' | 'video' | 'chat' | 'meeting' | 'moderation';
}

interface ModerationAction {
  id: string;
  type: 'mute' | 'kick' | 'ban' | 'warn';
  target: string;
  reason: string;
  timestamp: Date;
  moderator: string;
}

export const AdvancedPermissions = ({ isEnabled, onToggle }: AdvancedPermissionsProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const call = useCall();

  // Моковые данные для демонстрации
  // Реальные разрешения будут загружаться из Stream Permissions API

  // Реальные действия модерации будут загружаться из Stream Moderation API

  const categories = [
    { id: 'all', name: 'All', icon: SettingsIcon },
    { id: 'audio', name: 'Audio', icon: MicIcon },
    { id: 'video', name: 'Video', icon: VideoIcon },
    { id: 'chat', name: 'Chat', icon: MessageSquareIcon },
    { id: 'meeting', name: 'Meeting', icon: UsersIcon },
    { id: 'moderation', name: 'Moderation', icon: ShieldIcon },
  ] as const;

  useEffect(() => {
    if (isEnabled) {
      // TODO: Загрузить реальные разрешения из Stream API
      // setPermissions(realPermissions);
      // setModerationActions(realModerationActions);
    }
  }, [isEnabled]);

  const togglePermission = async (permissionId: string) => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь будет вызов Stream API для изменения разрешений
      setPermissions(prev => 
        prev.map(p => 
          p.id === permissionId 
            ? { ...p, enabled: !p.enabled }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'mute': return <MicIcon className="w-4 h-4 text-yellow-400" />;
      case 'kick': return <XCircleIcon className="w-4 h-4 text-red-400" />;
      case 'ban': return <AlertTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangleIcon className="w-4 h-4 text-orange-400" />;
      default: return <SettingsIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'mute': return 'border-yellow-500 bg-yellow-500/20';
      case 'kick': return 'border-red-500 bg-red-500/20';
      case 'ban': return 'border-red-600 bg-red-600/20';
      case 'warn': return 'border-orange-500 bg-orange-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  const filteredPermissions = selectedCategory === 'all' 
    ? permissions 
    : permissions.filter(p => p.category === selectedCategory);

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <ShieldIcon className="w-5 h-5" />
            Permissions & Moderation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Enable Advanced Permissions
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
            <ShieldIcon className="w-5 h-5" />
            Permissions & Moderation
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
        {/* Category Filter */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Categories</h4>
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-1 ${
                    isSelected 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="text-xs">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Permissions List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Permissions</h4>
          <ScrollArea className="h-48 w-full">
            <div className="space-y-2 pr-4">
              {filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="p-3 rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {permission.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {permission.description}
                      </p>
                    </div>
                    <Switch
                      checked={permission.enabled}
                      onCheckedChange={() => togglePermission(permission.id)}
                      disabled={isLoading}
                    />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {permission.category}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Moderation Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Recent Moderation Actions</h4>
          <ScrollArea className="h-32 w-full">
            <div className="space-y-2 pr-4">
              {moderationActions.map((action) => (
                <div
                  key={action.id}
                  className={`p-2 rounded-lg border ${getActionColor(action.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionIcon(action.type)}
                      <span className="text-sm font-medium text-white">
                        {action.type.charAt(0).toUpperCase() + action.type.slice(1)} {action.target}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {action.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Reason: {action.reason} • By: {action.moderator}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Summary */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• {permissions.filter(p => p.enabled).length} permissions enabled</p>
          <p>• {moderationActions.length} moderation actions today</p>
          <p>• {permissions.filter(p => p.category === 'moderation' && p.enabled).length} moderation tools active</p>
        </div>
      </CardContent>
    </Card>
  );
};
