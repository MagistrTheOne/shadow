"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotificationsStore } from "@/stores/notifications-store";
import { Bell, CheckCheck, Trash2, Check, RotateCw } from "lucide-react";

export function NotificationsPanel() {
  const {
    items,
    unreadCount,
    isLoading,
    hasMore,
    refresh,
    loadNext,
    markRead,
    markAllRead,
    remove,
    clearAll,
  } = useNotificationsStore();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const formatNotificationType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null;
    if (typeof metadata === 'string') return metadata;
    if (metadata.meetingTitle) return metadata.meetingTitle;
    if (metadata.message) return metadata.message;
    return null;
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs">{unreadCount}</Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={refresh}
            disabled={isLoading}
            title="Refresh"
            aria-label="Refresh notifications"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="icon"
            onClick={markAllRead}
            variant="secondary"
            disabled={unreadCount === 0}
            title="Mark all as read"
            aria-label="Mark all notifications as read"
          >
            <CheckCheck className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={clearAll}
            title="Clear all notifications"
            aria-label="Clear all notifications"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-muted-strong">No notifications.</div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto space-y-2">
            {items.map((n) => {
              const metadataText = formatMetadata(n.metadata);
              return (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg dashboard-surface">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-high-contrast break-words">
                      {formatNotificationType(n.type)}
                    </div>
                    {metadataText && (
                      <div className="text-xs text-muted-strong mt-1 break-words">
                        {metadataText}
                      </div>
                    )}
                    <div className="text-xs text-muted-strong mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!n.isRead && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => markRead(n.id)}
                        title="Mark as read"
                        aria-label="Mark notification as read"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => remove(n.id)}
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {hasMore && (
          <div className="pt-2">
            <Button onClick={loadNext} disabled={isLoading} className="w-full">
              Load more
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
