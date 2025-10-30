"use client";

import { useCallback, useState } from "react";

export type ConversationMessage = {
  id: string;
  type: 'user' | 'agent';
  message: string;
  timestamp: Date;
};

export function useConversationHistory(initial: ConversationMessage[] = []) {
  const [history, setHistory] = useState<ConversationMessage[]>(initial);

  const add = useCallback((msg: Omit<ConversationMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: Date }) => {
    setHistory(prev => [
      ...prev,
      {
        id: msg.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: msg.timestamp ?? new Date(),
        type: msg.type,
        message: msg.message.trim(),
      },
    ]);
  }, []);

  const clear = useCallback(() => setHistory([]), []);

  return { history, add, clear } as const;
}


