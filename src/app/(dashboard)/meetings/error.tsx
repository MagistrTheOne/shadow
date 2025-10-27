"use client";

import { ErrorState } from "@/components/error-state";

export default function MeetingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Something went wrong with meetings"
      description={error.message || "Failed to load meetings. Please try again."}
      onRetry={reset}
    />
  );
}
