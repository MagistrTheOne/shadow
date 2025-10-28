"use client";

import { useEffect, useCallback } from "react";
import { trpc } from "@/trpc/client";

export function usePresence() {
  const { data: profile } = trpc.users.getCurrentProfile.useQuery();
  const updateStatus = trpc.users.updateStatus.useMutation();

  // Heartbeat function to keep user online
  const heartbeat = useCallback(async () => {
    if (profile?.status === "offline") return;

    try {
      await updateStatus.mutateAsync({
        status: profile?.status || "online",
        richPresence: profile?.richPresence,
      });
    } catch (error) {
      console.error("Heartbeat failed:", error);
    }
  }, [profile?.status, profile?.richPresence, updateStatus]);

  // Set up heartbeat interval
  useEffect(() => {
    if (!profile) return;

    // Initial heartbeat
    heartbeat();

    // Set up interval for heartbeat (every 60 seconds)
    const interval = setInterval(heartbeat, 60000);

    return () => clearInterval(interval);
  }, [heartbeat, profile]);

  // Set user as online on mount
  useEffect(() => {
    if (profile && profile.status === "offline") {
      updateStatus.mutate({
        status: "online",
        richPresence: profile.richPresence,
      });
    }
  }, [profile, updateStatus]);

  // Set user as offline on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (profile) {
        // Use sendBeacon for reliable offline status update
        navigator.sendBeacon(
          "/api/trpc/users.updateStatus",
          JSON.stringify({
            status: "offline",
            richPresence: profile.richPresence,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [profile]);

  // Update rich presence when joining/leaving meetings
  const updateRichPresence = useCallback(
    (richPresence: any) => {
      if (profile) {
        updateStatus.mutate({
          status: profile.status || "online",
          richPresence,
        });
      }
    },
    [profile, updateStatus]
  );

  return {
    updateRichPresence,
    currentStatus: profile?.status,
    currentRichPresence: profile?.richPresence,
  };
}
