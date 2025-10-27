"use client";

import React, { Suspense } from "react";
import { VideoCall } from "@/modules/meetings/ui/components/video-call";
import { LoadingState } from "@/components/loading-state";

interface MeetingCallPageProps {
  params: Promise<{
    id: string;
  }>;
}

const MeetingCallPage = ({ params }: MeetingCallPageProps) => {
  return (
    <div className="h-full w-full">
      <Suspense fallback={<LoadingState title="Preparing video call..." description="Connecting to Stream services." />}>
        <MeetingCallPageContent params={params} />
      </Suspense>
    </div>
  );
};

const MeetingCallPageContent = ({ params }: MeetingCallPageProps) => {
  const { id } = React.use(params);

  return <VideoCall callId={id} />;
};

export default MeetingCallPage;