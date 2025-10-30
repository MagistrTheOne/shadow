"use client";

import { useCallback, useRef, useState } from "react";

export interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export function useTextToSpeech({ rate = 0.9, pitch = 1.0, volume = 0.8, lang = "en-US" }: UseTextToSpeechOptions = {}) {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const speak = useCallback((text: string) => {
    if (!text) return;
    if (isMuted) return;
    if (utterRef.current) {
      try { speechSynthesis.cancel(); } catch {}
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = isMuted ? 0 : volume;
    utter.lang = lang;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    utterRef.current = utter;
    speechSynthesis.speak(utter);
  }, [isMuted, rate, pitch, volume, lang]);

  const cancel = useCallback(() => {
    try { speechSynthesis.cancel(); } finally { setIsSpeaking(false); }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (isSpeaking) {
      try { speechSynthesis.cancel(); } finally { setIsSpeaking(false); }
    }
  }, [isSpeaking]);

  return { isSpeaking, isMuted, speak, cancel, toggleMute } as const;
}


