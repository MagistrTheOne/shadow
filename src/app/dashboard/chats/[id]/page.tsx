import { Suspense } from "react";
import { ChatClient } from "./chat-client";

interface ChatPageProps {
  params: { id: string };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = params;

  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatClient chatId={id} />
    </Suspense>
  );
}
