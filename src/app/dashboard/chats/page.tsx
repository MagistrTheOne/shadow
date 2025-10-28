import { Suspense } from "react";
import { ChatsClient } from "./chats-client";

export default function ChatsPage() {
  return (
    <Suspense fallback={<div>Loading chats...</div>}>
      <ChatsClient />
    </Suspense>
  );
}
