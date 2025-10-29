"use client";

import { useEffect, useState } from 'react';
import { StreamFeed } from 'stream-feed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Heart, MessageSquare, Share, User, Calendar, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

interface StreamActivityFeedsProps {
  isEnabled: boolean;
  onToggle: () => void;
}

interface ActivityEvent {
  id: string;
  actor: string;
  verb: string;
  object: string;
  time: Date;
  message?: string;
  attachments?: any[];
  reactions?: { [key: string]: number };
}

export function StreamActivityFeeds({ isEnabled, onToggle }: StreamActivityFeedsProps) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedClient, setFeedClient] = useState<StreamFeed | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isEnabled) {
      initializeActivityFeeds();
    }
  }, [isEnabled]);

  const initializeActivityFeeds = async () => {
    try {
      setIsLoading(true);
      
      // Получаем данные пользователя
      const { data: session } = await authClient.api.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      setUser(session.user);

      // Создаем Stream Feed клиент
      const client = new StreamFeed(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        process.env.STREAM_API_SECRET!,
        process.env.NEXT_PUBLIC_STREAM_APP_ID!
      );

      // Создаем токен для пользователя
      const token = client.createUserToken(session.user.id);
      
      // Аутентифицируем пользователя
      await client.setUser(session.user.id, token);

      setFeedClient(client);

      // Подписываемся на фид пользователя
      const userFeed = client.feed('user', session.user.id);
      const activities = await userFeed.get({ limit: 20 });
      
      setActivities(activities.results.map((activity: any) => ({
        id: activity.id,
        actor: activity.actor,
        verb: activity.verb,
        object: activity.object,
        time: new Date(activity.time),
        message: activity.message,
        attachments: activity.attachments,
        reactions: activity.reactions
      })));

      // Подписываемся на real-time обновления
      userFeed.subscribe((data) => {
        if (data.new) {
          const newActivity: ActivityEvent = {
            id: data.new.id,
            actor: data.new.actor,
            verb: data.new.verb,
            object: data.new.object,
            time: new Date(data.new.time),
            message: data.new.message,
            attachments: data.new.attachments,
            reactions: data.new.reactions
          };
          
          setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
        }
      });

      setIsActive(true);
      toast.success('Activity Feeds activated');
    } catch (error) {
      console.error('Error initializing Activity Feeds:', error);
      toast.error('Failed to initialize Activity Feeds');
    } finally {
      setIsLoading(false);
    }
  };

  const stopActivityFeeds = async () => {
    try {
      if (feedClient) {
        // Отписываемся от всех фидов
        const userFeed = feedClient.feed('user', user?.id);
        await userFeed.unsubscribe();
        
        feedClient.disconnect();
        setFeedClient(null);
      }
      setIsActive(false);
      setActivities([]);
      toast.success('Activity Feeds deactivated');
    } catch (error) {
      console.error('Error stopping Activity Feeds:', error);
      toast.error('Failed to stop Activity Feeds');
    }
  };

  const addActivity = async (verb: string, object: string, message?: string) => {
    if (!feedClient || !user) return;

    try {
      const userFeed = feedClient.feed('user', user.id);
      await userFeed.addActivity({
        verb,
        object,
        message,
        time: new Date().toISOString()
      });
      
      toast.success('Activity added');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    }
  };

  const addReaction = async (activityId: string, kind: string) => {
    if (!feedClient || !user) return;

    try {
      const userFeed = feedClient.feed('user', user.id);
      await userFeed.addReaction(kind, activityId);
      
      toast.success('Reaction added');
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const getActivityIcon = (verb: string) => {
    switch (verb) {
      case 'post': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'like': return <Heart className="w-4 h-4 text-red-400" />;
      case 'share': return <Share className="w-4 h-4 text-green-400" />;
      case 'join': return <User className="w-4 h-4 text-purple-400" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-orange-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (time: Date) => {
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isEnabled) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            Activity Feeds
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-400 mb-4">Enable Activity Feeds for social engagement</p>
          <Button onClick={onToggle} className="w-full">
            Enable Activity Feeds
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
            <Activity className="w-5 h-5" />
            Activity Feeds
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Quick Actions</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addActivity('post', 'status', 'Joined a meeting')}
              disabled={!isActive}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Post Status
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addActivity('meeting', 'call', 'Started a video call')}
              disabled={!isActive}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Meeting
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button
              onClick={initializeActivityFeeds}
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
                  <Activity className="w-4 h-4 mr-2" />
                  Start Activity Feeds
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={stopActivityFeeds}
              variant="destructive"
              className="flex-1"
            >
              <Activity className="w-4 h-4 mr-2" />
              Stop Activity Feeds
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

        {/* Activity Feed */}
        {isActive && activities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Recent Activities</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {activities.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                >
                  {getActivityIcon(activity.verb)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">
                      <span className="font-medium">{activity.actor}</span>
                      <span className="text-gray-400"> {activity.verb} </span>
                      <span className="text-gray-300">{activity.object}</span>
                    </div>
                    {activity.message && (
                      <div className="text-xs text-gray-400 mt-1">
                        {activity.message}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(activity.time)}
                      </span>
                      {activity.reactions && (
                        <div className="flex gap-1">
                          {Object.entries(activity.reactions).map(([kind, count]) => (
                            <Button
                              key={kind}
                              size="sm"
                              variant="ghost"
                              onClick={() => addReaction(activity.id, kind)}
                              className="h-6 px-2 text-xs"
                            >
                              {kind === 'like' ? '❤️' : '👍'} {count}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {isActive && (
          <div className="bg-purple-500/20 border border-purple-400/30 rounded p-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              Activity Feeds are actively tracking engagement
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
