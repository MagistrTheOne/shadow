import { Suspense } from "react";
import { ChatClient } from "./chat-client";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatClient chatId={id} />
    </Suspense>
  );
}
