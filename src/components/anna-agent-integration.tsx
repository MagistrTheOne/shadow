"use client";

import { useState } from 'react';
import { AnnaAvatar } from './anna-avatar';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Mic, MicOff, MessageSquare, Video } from 'lucide-react';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useConversationHistory } from '@/hooks/useConversationHistory';

interface AnnaAgentIntegrationProps {
  agentId: string;
  agentName: string;
  agentPersonality?: string;
  isActive?: boolean;
  onAgentResponse?: (response: string) => void;
}

export function AnnaAgentIntegration({
  agentId,
  agentName,
  agentPersonality = "friendly and helpful",
  isActive = false,
  onAgentResponse
}: AnnaAgentIntegrationProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const { history: conversationHistory, add: addMessage } = useConversationHistory();
  const { isSpeaking, isMuted, speak, toggleMute, cancel } = useTextToSpeech({ lang: 'en-US' });
  const { isSupported, isListening, start, stop } = useSpeechRecognition({
    lang: 'en-US',
    onResult: (text) => {
      setCurrentMessage(text);
      handleSendMessage(text);
    },
    onError: () => toast.error('Speech recognition failed'),
  });

  // Получаем данные агента
  const { data: agent } = trpc.agents.getOne.useQuery({ id: agentId });
  
  // Мутация для отправки сообщения агенту
  const sendMessage = trpc.agents.testAgent.useMutation({
    onSuccess: (response) => {
      const msg = response.response || 'I understand your message.';
      addMessage({ type: 'agent', message: msg });
      onAgentResponse?.(msg);
      speak(msg);
    },
    onError: (error) => {
      toast.error('Failed to get response from agent');
      cancel();
    }
  });

  const handleVoiceInput = () => {
    if (!isSupported) {
      toast.error('Speech recognition not supported');
      return;
    }
    isListening ? stop() : start();
  };

  // Отправка сообщения агенту
  const handleSendMessage = (message: string) => {
    if (!message.trim() || !agent) return;

    addMessage({ type: 'user', message: message.trim() });
    setCurrentMessage('');

    // Отправляем сообщение агенту через tRPC
    sendMessage.mutate({
      agentId: agentId,
      message: message.trim()
    });
  };

  // Обработка клавиатуры
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentMessage);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto dashboard-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Bot className="w-5 h-5" />
          ANNA + {agentName}
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {agentPersonality}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ANNA Avatar */}
        <div className="flex justify-center">
          <AnnaAvatar
            isSpeaking={isSpeaking}
            isListening={isListening}
            size="large"
            className="transition-all duration-300"
          />
        </div>

        {/* Conversation History */}
        <div className="h-64 overflow-y-auto bg-black/20 rounded-lg p-4 space-y-2">
          {conversationHistory.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">
              Start a conversation with {agentName} through ANNA
            </div>
          ) : (
            conversationHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Controls */}
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type a message to ${agentName}...`}
            className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSpeaking}
          />
          
          <Button onClick={handleVoiceInput} variant={isListening ? "destructive" : "outline"} size="sm" className="px-3">
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            onClick={() => handleSendMessage(currentMessage)}
            size="sm"
            disabled={!currentMessage.trim()}
            className="px-3"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          {isSpeaking && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              {agentName} is thinking...
            </div>
          )}
          {isListening && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
