"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Users, Loader2 } from 'lucide-react';

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

interface InteractiveAvatarProps {
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export const InteractiveAvatar = ({ onReady, onError }: InteractiveAvatarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentText, setCurrentText] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Avatar animation states
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  const [eyeBlink, setEyeBlink] = useState(false);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          handleUserInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setAvatarState('idle');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setAvatarState('idle');
      };
    }

    // Initialize canvas animation
    initializeCanvas();

    // Eye blink animation
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3000);

    setIsReady(true);
    onReady?.();

    return () => {
      clearInterval(blinkInterval);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [onReady]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Draw initial avatar
    drawAvatar(ctx);
  };

  const drawAvatar = (ctx: CanvasRenderingContext2D) => {
    const centerX = 200;
    const centerY = 200;
    
    // Clear canvas
    ctx.clearRect(0, 0, 400, 400);
    
    // Background circle
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 180, 0, 2 * Math.PI);
    ctx.fill();
    
    // Face
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 120, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eyes
    const eyeY = centerY - 30;
    const eyeOffset = 40;
    
    // Left eye
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffset, eyeY, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(centerX + eyeOffset, eyeY, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eye blink effect
    if (eyeBlink) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(centerX - eyeOffset - 15, eyeY - 15, 30, 30);
      ctx.fillRect(centerX + eyeOffset - 15, eyeY - 15, 30, 30);
    }
    
    // Mouth based on state
    ctx.fillStyle = '#1f2937';
    if (avatarState === 'speaking') {
      // Speaking mouth (oval)
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 40, 25, 15, 0, 0, 2 * Math.PI);
      ctx.fill();
    } else if (avatarState === 'listening') {
      // Listening mouth (small circle)
      ctx.beginPath();
      ctx.arc(centerX, centerY + 40, 8, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Idle mouth (line)
      ctx.beginPath();
      ctx.moveTo(centerX - 20, centerY + 40);
      ctx.lineTo(centerX + 20, centerY + 40);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Status indicator
    let statusColor = '#6b7280';
    if (avatarState === 'listening') statusColor = '#3b82f6';
    if (avatarState === 'speaking') statusColor = '#10b981';
    if (avatarState === 'thinking') statusColor = '#f59e0b';
    
    ctx.fillStyle = statusColor;
    ctx.beginPath();
    ctx.arc(centerX + 140, centerY - 140, 8, 0, 2 * Math.PI);
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawAvatar(ctx);
  }, [avatarState, eyeBlink]);

  const handleUserInput = async (text: string) => {
    setAvatarState('thinking');
    setCurrentText(`Processing: "${text}"`);
    
    try {
      // Real AI integration - replace with actual AI service call
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          context: 'meeting_assistant'
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      speakText(data.response || "I'm processing your request...");
    } catch (error) {
      console.error('AI service error:', error);
      // Fallback responses
      const fallbackResponses = [
        "I'm having trouble processing that right now. Could you try again?",
        "I understand you're speaking, but I need a moment to process.",
        "That's an interesting point! Let me think about that.",
        "I'm here to help with your meeting needs."
      ];
      
      const response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      speakText(response);
    }
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    
    setCurrentText(text);
    setAvatarState('speaking');
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setAvatarState('idle');
      setCurrentText('');
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setAvatarState('idle');
      setCurrentText('');
    };
    
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      onError?.(new Error('Speech recognition not supported'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setAvatarState('listening');
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setAvatarState('idle');
    }
  };

  const handleDemoSpeak = () => {
    const demoText = "Hello! I'm Shadow AI, your intelligent meeting assistant. I can help you with meeting insights, action items, and real-time collaboration. How can I assist you today?";
    speakText(demoText);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col">
      {/* Avatar Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full"
          style={{ maxWidth: '300px', maxHeight: '300px' }}
        />
      </div>
      
      {/* Status Text */}
      {currentText && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-3">
            <p className="text-white text-sm text-center">{currentText}</p>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-full backdrop-blur-sm">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={toggleMute} 
          className="text-white hover:bg-white/20"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        
        <Button
          size="sm"
          variant={isListening ? 'default' : 'outline'}
          onClick={toggleListening}
          disabled={isSpeaking}
          className={`${
            isListening 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'border-white/20 text-white hover:bg-white/10'
          }`}
        >
          {isSpeaking ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : isListening ? (
            <MicOff className="w-4 h-4 mr-2" />
          ) : (
            <Mic className="w-4 h-4 mr-2" />
          )}
          {isSpeaking ? 'Speaking...' : isListening ? 'Stop' : 'Listen'}
        </Button>
        
        <Button 
          size="sm" 
          onClick={handleDemoSpeak}
          disabled={isSpeaking || isListening}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Demo
        </Button>
      </div>
      
      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-white z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Initializing AI Avatar...</p>
          </div>
        </div>
      )}
    </div>
  );
};
