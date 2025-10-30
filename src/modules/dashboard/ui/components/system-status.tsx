"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SystemStatus = 'online' | 'degraded' | 'offline';

export const SystemStatus = () => {
  const [status, setStatus] = useState<SystemStatus>('online');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    let interval: number | null = null;
    let abortController: AbortController | null = null;

    const checkStatus = async () => {
      try {
        abortController?.abort();
        abortController = new AbortController();
        const response = await fetch('/api/health', {
          method: 'GET',
          signal: abortController.signal,
          cache: 'no-store',
        });
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('degraded');
        }
      } catch (e) {
        if ((e as any)?.name !== 'AbortError') {
          setStatus('offline');
        }
      } finally {
        setLastChecked(new Date());
      }
    };

    checkStatus();
    interval = window.setInterval(checkStatus, 60000);
    return () => {
      if (interval !== null) window.clearInterval(interval);
      abortController?.abort();
    };
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          label: 'All systems operational'
        };
      case 'degraded':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500',
          label: 'Some services degraded'
        };
      case 'offline':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500',
          label: 'Service unavailable'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center cursor-pointer">
            <div className={`w-2 h-2 rounded-full ${config.bgColor} animate-pulse`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-black/90 border-white/10 text-white">
          <div className="flex items-center space-x-2">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <div>
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-gray-400">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
