"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BotIcon, MicIcon, MicOffIcon, Volume2Icon, VolumeXIcon, SettingsIcon } from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";

interface VoiceAgentProps {
  callId: string;
  callType?: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const VoiceAgent = ({ callId, callType = 'default', isEnabled, onToggle }: VoiceAgentProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [agentResponse, setAgentResponse] = useState<string>("");

  const call = useCall();

  const connectVoiceAgent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stream/voice-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId,
          callType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect voice agent');
      }

      const data = await response.json();
      setIsConnected(data.agentConnected);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectVoiceAgent = async () => {
    setIsConnected(false);
    setIsListening(false);
    setTranscript("");
    setAgentResponse("");
  };

  const startListening = () => {
    if (!isConnected) return;
    
    setIsListening(true);
    // Здесь будет логика для начала прослушивания
    // В реальном приложении это будет интегрировано с Web Speech API
  };

  const stopListening = () => {
    setIsListening(false);
    // Здесь будет логика для остановки прослушивания
  };

  useEffect(() => {
    if (isEnabled && !isConnected) {
      connectVoiceAgent();
    } else if (!isEnabled && isConnected) {
      disconnectVoiceAgent();
    }
  }, [isEnabled]);

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <BotIcon className="w-5 h-5" />
            Voice Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Enable Voice Agent
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
            <BotIcon className="w-5 h-5" />
            Voice Agent
          </CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {error && (
          <div className="text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        {isLoading && (
          <div className="text-blue-400 text-sm">
            Connecting voice agent...
          </div>
        )}

        {isConnected && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Listening</span>
                <Button
                  size="sm"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={isListening ? stopListening : startListening}
                  className="w-20"
                >
                  {isListening ? (
                    <MicOffIcon className="w-4 h-4" />
                  ) : (
                    <MicIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {transcript && (
                <div className="bg-black/20 p-3 rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">You said:</p>
                  <p className="text-white text-sm">{transcript}</p>
                </div>
              )}

              {agentResponse && (
                <div className="bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Agent response:</p>
                  <p className="text-white text-sm">{agentResponse}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={disconnectVoiceAgent}
                className="flex-1"
              >
                Disconnect
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onToggle}
                className="flex-1"
              >
                <SettingsIcon className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </>
        )}

        {!isConnected && !isLoading && (
          <Button
            onClick={connectVoiceAgent}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            Connect Voice Agent
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
