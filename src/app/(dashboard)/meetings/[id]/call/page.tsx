"use client";

import { VideoCall } from "@/modules/meetings/ui/components/video-call";
import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";

interface MeetingCallPageProps {
  params: {
    id: string;
  };
}

const MeetingCallPage = ({ params }: MeetingCallPageProps) => {
  return (
    <div className="h-full w-full">
      <Suspense fallback={<LoadingState title="Preparing video call..." description="Connecting to Stream services." />}>
        <VideoCall callId={params.id} />
      </Suspense>
    </div>
  );
};

export default MeetingCallPage;