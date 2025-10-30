"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSpeechRecognitionOptions {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  onResult?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useSpeechRecognition({
  lang = "en-US",
  interimResults = false,
  continuous = false,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
    const recog = new SpeechRecognition();
    recog.lang = lang;
    recog.interimResults = interimResults;
    recog.continuous = continuous;
    recog.onresult = (event: any) => {
      try {
        const transcript = event.results[0][0].transcript as string;
        onResult?.(transcript);
      } catch (e) {
        onError?.(e as Error);
      }
    };
    recog.onerror = (event: any) => onError?.(new Error(event?.error || "speech_recognition_error"));
    recog.onstart = () => setIsListening(true);
    recog.onend = () => setIsListening(false);
    recognitionRef.current = recog;
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
    };
  }, [lang, interimResults, continuous, onResult, onError]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }, []);

  return { isSupported, isListening, start, stop } as const;
}


