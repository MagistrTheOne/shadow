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
  const mockPermissions: Permission[] = [
    // Audio permissions
    { id: 'audio_mute_all', name: 'Mute All Participants', description: 'Allow host to mute all participants at once', enabled: true, category: 'audio' },
    { id: 'audio_unmute_request', name: 'Unmute Request', description: 'Participants can request to be unmuted', enabled: true, category: 'audio' },
    { id: 'audio_auto_mute', name: 'Auto Mute on Join', description: 'Automatically mute participants when they join', enabled: false, category: 'audio' },
    
    // Video permissions
    { id: 'video_turn_off_all', name: 'Turn Off All Cameras', description: 'Allow host to turn off all cameras', enabled: true, category: 'video' },
    { id: 'video_require_approval', name: 'Camera Approval Required', description: 'Host must approve camera access', enabled: false, category: 'video' },
    { id: 'video_background_effects', name: 'Background Effects', description: 'Allow participants to use background effects', enabled: true, category: 'video' },
    
    // Chat permissions
    { id: 'chat_send_messages', name: 'Send Messages', description: 'Allow participants to send chat messages', enabled: true, category: 'chat' },
    { id: 'chat_send_files', name: 'Send Files', description: 'Allow participants to send files', enabled: true, category: 'chat' },
    { id: 'chat_private_messages', name: 'Private Messages', description: 'Allow private messages between participants', enabled: false, category: 'chat' },
    
    // Meeting permissions
    { id: 'meeting_invite_others', name: 'Invite Others', description: 'Allow participants to invite others', enabled: true, category: 'meeting' },
    { id: 'meeting_share_screen', name: 'Share Screen', description: 'Allow participants to share their screen', enabled: true, category: 'meeting' },
    { id: 'meeting_record', name: 'Record Meeting', description: 'Allow participants to record the meeting', enabled: false, category: 'meeting' },
    
    // Moderation permissions
    { id: 'mod_kick_participants', name: 'Kick Participants', description: 'Allow moderators to kick participants', enabled: true, category: 'moderation' },
    { id: 'mod_ban_participants', name: 'Ban Participants', description: 'Allow moderators to ban participants', enabled: true, category: 'moderation' },
    { id: 'mod_remove_messages', name: 'Remove Messages', description: 'Allow moderators to remove chat messages', enabled: true, category: 'moderation' },
  ];

  const mockModerationActions: ModerationAction[] = [
    {
      id: '1',
      type: 'mute',
      target: 'John Smith',
      reason: 'Background noise',
      timestamp: new Date(Date.now() - 300000),
      moderator: 'Jane Doe'
    },
    {
      id: '2',
      type: 'warn',
      target: 'Mike Johnson',
      reason: 'Inappropriate language',
      timestamp: new Date(Date.now() - 180000),
      moderator: 'Jane Doe'
    },
    {
      id: '3',
      type: 'kick',
      target: 'Spam User',
      reason: 'Spamming chat',
      timestamp: new Date(Date.now() - 120000),
      moderator: 'John Smith'
    }
  ];

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
      setPermissions(mockPermissions);
      setModerationActions(mockModerationActions);
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
