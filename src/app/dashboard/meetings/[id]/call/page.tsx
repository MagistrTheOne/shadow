import { Suspense } from "react";
import { MeetingCallClient } from "./meeting-call-client";

interface MeetingCallPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingCallPage({ params }: MeetingCallPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading meeting call...</div>}>
      <MeetingCallClient id={id} />
    </Suspense>
  );
}
