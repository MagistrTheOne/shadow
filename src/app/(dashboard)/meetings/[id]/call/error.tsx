"use client";

import { ErrorState } from "@/components/error-state";

export default function MeetingCallError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Video call connection failed"
      description={error.message || "Failed to connect to the video call. Please check your connection and try again."}
      onRetry={reset}
    />
  );
}
