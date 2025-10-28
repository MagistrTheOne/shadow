"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Meeting Scheduled",
      message: "Your meeting with AI Assistant is scheduled for 2:00 PM",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: "2",
      title: "Agent Updated",
      message: 'Your AI agent "Sales Bot" has been successfully updated',
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    {
      id: "3",
      title: "Storage Warning",
      message: "You are using 85% of your storage quota",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-cyan-400";
    }
  };

  const getGlow = (type: string) => {
    switch (type) {
      case "success":
        return "shadow-[0_0_10px_-2px_rgba(34,197,94,0.6)]";
      case "warning":
        return "shadow-[0_0_10px_-2px_rgba(234,179,8,0.6)]";
      case "error":
        return "shadow-[0_0_10px_-2px_rgba(239,68,68,0.6)]";
      default:
        return "shadow-[0_0_10px_-2px_rgba(56,189,248,0.6)]";
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all duration-300"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse bg-red-500"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-black/80 backdrop-blur-xl border border-cyan-400/20 rounded-xl shadow-[0_0_30px_-10px_rgba(56,189,248,0.4)] overflow-hidden animate-fade-slide"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
          <span className="text-white font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-gray-400 hover:text-cyan-300"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-3 cursor-pointer group relative transition-all duration-200 rounded-md ${
                !n.read ? "bg-white/5 hover:bg-cyan-400/10" : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-start space-x-3 w-full">
                {/* Indicator */}
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(n.type).replace(
                    "text-",
                    "bg-"
                  )} ${getGlow(n.type)}`}
                />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-medium ${
                        n.read ? "text-gray-300" : "text-white"
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <Check className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>

      <style jsx global>{`
        @keyframes fadeSlide {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        .animate-fade-slide {
          animation: fadeSlide 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </DropdownMenu>
  );
};
