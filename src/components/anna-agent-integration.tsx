"use client";

import { useState, useEffect } from 'react';
import { AnnaAvatar } from './anna-avatar';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Mic, MicOff, MessageSquare, Video } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    type: 'user' | 'agent';
    message: string;
    timestamp: Date;
  }>>([]);

  // Получаем данные агента
  const { data: agent } = trpc.agents.getOne.useQuery({ id: agentId });
  
  // Мутация для отправки сообщения агенту
  const sendMessage = trpc.agents.testAgent.useMutation({
    onSuccess: (response) => {
      const agentMessage = {
        id: Date.now().toString(),
        type: 'agent' as const,
        message: response.response || 'I understand your message.',
        timestamp: new Date()
      };
      
      setConversationHistory(prev => [...prev, agentMessage]);
      onAgentResponse?.(agentMessage.message);
      setIsSpeaking(false);
    },
    onError: (error) => {
      toast.error('Failed to get response from agent');
      setIsSpeaking(false);
    }
  });

  // Обработка голосового ввода
  const handleVoiceInput = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        handleSendMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Speech recognition failed');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast.error('Speech recognition not supported');
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  // Отправка сообщения агенту
  const handleSendMessage = (message: string) => {
    if (!message.trim() || !agent) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: message.trim(),
      timestamp: new Date()
    };

    setConversationHistory(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsSpeaking(true);

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
    <Card className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-white">
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
          
          <Button
            onClick={handleVoiceInput}
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            disabled={isSpeaking}
            className="px-3"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            onClick={() => handleSendMessage(currentMessage)}
            size="sm"
            disabled={!currentMessage.trim() || isSpeaking}
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
