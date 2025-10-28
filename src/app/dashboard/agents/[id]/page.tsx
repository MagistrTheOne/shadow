import { Suspense } from "react";
import { AgentClient } from "./agent-client";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentClient id={id} />
    </Suspense>
  );
}