import { Suspense } from "react";
import { EditAgentClient } from "./edit-client";

interface EditAgentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAgentPage({ params }: EditAgentPageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditAgentClient id={id} />
    </Suspense>
  );
}