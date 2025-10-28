"use client";

import { ErrorState } from "@/components/error-state";

export default function AgentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Something went wrong with agents"
      description={error.message || "Failed to load agents. Please try again."}
      onRetry={reset}
    />
  );
}