"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BotIcon, MicIcon, MicOffIcon, Volume2Icon, VolumeXIcon } from "lucide-react";

// Type declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface AIAvatarControllerProps {
  meetingId: string;
  isVisible: boolean;
  onToggle: () => void;
  agentId?: string;
}

export const AIAvatarController = ({
  meetingId,
  isVisible,
  onToggle,
  agentId,
}: AIAvatarControllerProps) => {
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [transcript, setTranscript] = useState<string>("");
  const [lastResponse, setLastResponse] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "ru-RU"; // Russian language

      recognition.onstart = () => {
        setAvatarState("listening");
      };

      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        setAvatarState("thinking");

        // Process with AI
        try {
          const response = await processWithAI(speechResult);
          setLastResponse(response);
          setAvatarState("speaking");

          // Speak response if audio is enabled
          if (isAudioEnabled && synthRef.current) {
            speakResponse(response);
          }
        } catch (error) {
          console.error("AI processing error:", error);
          setAvatarState("idle");
        }
      };

      recognition.onend = () => {
        if (avatarState === "listening") {
          setAvatarState("idle");
        }
      };

      recognitionRef.current = recognition;
    }

    // Initialize speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isAudioEnabled, avatarState]);

  const processWithAI = async (input: string): Promise<string> => {
    // Call GigaChat API for response generation
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          meetingId,
          agentId,
          context: "meeting_assistance",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data.response || "Извините, я не смог обработать ваш запрос.";
    } catch (error) {
      console.error("GigaChat API error:", error);
      return "Произошла ошибка при обработке запроса.";
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU"; // Russian voice
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setAvatarState("speaking");
    };

    utterance.onend = () => {
      setAvatarState("idle");
    };

    utterance.onerror = () => {
      setAvatarState("idle");
    };

    synthRef.current.speak(utterance);
  };

  const toggleMicrophone = () => {
    if (!recognitionRef.current) return;

    if (isMicEnabled) {
      recognitionRef.current.stop();
      setIsMicEnabled(false);
    } else {
      recognitionRef.current.start();
      setIsMicEnabled(true);
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (synthRef.current && !isAudioEnabled) {
      synthRef.current.cancel();
    }
  };

  const getStateBadge = () => {
    const stateConfig = {
      idle: { text: "Готов", variant: "secondary" as const },
      listening: { text: "Слушаю", variant: "default" as const },
      thinking: { text: "Думаю", variant: "outline" as const },
      speaking: { text: "Говорю", variant: "destructive" as const },
    };

    const config = stateConfig[avatarState];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        size="sm"
      >
        <BotIcon className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-black/90 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BotIcon className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white text-sm">AI Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStateBadge()}
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Placeholder */}
          <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <BotIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">AI Avatar</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={toggleMicrophone}
              variant={isMicEnabled ? "destructive" : "outline"}
              size="sm"
              className="flex items-center gap-1"
            >
              {isMicEnabled ? <MicOffIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
              {isMicEnabled ? "Stop" : "Listen"}
            </Button>
            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1"
            >
              {isAudioEnabled ? <Volume2Icon className="w-4 h-4" /> : <VolumeXIcon className="w-4 h-4" />}
              Audio
            </Button>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">You said:</p>
              <p className="text-sm text-white">{transcript}</p>
            </div>
          )}

          {/* Last Response */}
          {lastResponse && (
            <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/20">
              <p className="text-xs text-blue-400 mb-1">AI Response:</p>
              <p className="text-sm text-white">{lastResponse}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
