"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MessageSquare, Video } from "lucide-react";
import Link from "next/link";

export default function SessionResolverPage() {
  const params = useParams();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  
  const code = params.code as string;

  const { data: session, isLoading, isError } = trpc.sessions.getByCode.useQuery({ code });
  const joinSession = trpc.sessions.join.useMutation({
    onSuccess: (result) => {
      if (result.joined) {
        // Redirect based on session type
        if (session?.type === "meeting") {
          // Find the meeting linked to this session
          router.push(`/dashboard/meetings/${session.id}/call`);
        } else if (session?.type === "call") {
          router.push(`/dashboard/sessions/${session.id}/call`);
        } else if (session?.type === "chat") {
          router.push(`/dashboard/sessions/${session.id}/chat`);
        }
      } else {
        // Already a participant, redirect
        if (session?.type === "meeting") {
          router.push(`/dashboard/meetings/${session.id}/call`);
        } else if (session?.type === "call") {
          router.push(`/dashboard/sessions/${session.id}/call`);
        } else if (session?.type === "chat") {
          router.push(`/dashboard/sessions/${session.id}/chat`);
        }
      }
    },
    onError: (error) => {
      console.error("Failed to join session:", error);
    },
  });

  const handleJoin = () => {
    setIsJoining(true);
    joinSession.mutate({ code });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingState
          title="Loading session..."
          description="Finding session details"
        />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ErrorState
            title="Session not found"
            description="The session you're looking for doesn't exist or has ended."
          />
          <div className="mt-6">
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (session.status !== "active") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Ended</h1>
          <p className="text-gray-400 mb-6">This session has ended or expired.</p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getSessionIcon = () => {
    switch (session.type) {
      case "meeting":
        return <Video className="w-8 h-8 text-blue-400" />;
      case "call":
        return <Video className="w-8 h-8 text-green-400" />;
      case "chat":
        return <MessageSquare className="w-8 h-8 text-purple-400" />;
      default:
        return <Users className="w-8 h-8 text-gray-400" />;
    }
  };

  const getSessionTitle = () => {
    switch (session.type) {
      case "meeting":
        return "Meeting Session";
      case "call":
        return "Video Call";
      case "chat":
        return "Chat Session";
      default:
        return "Session";
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          {getSessionIcon()}
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">{getSessionTitle()}</h1>
        <p className="text-gray-400 mb-2">Session Code: <span className="font-mono text-white">{session.code}</span></p>
        
        {session.expiresAt && (
          <p className="text-gray-500 text-sm mb-6">
            Expires: {new Date(session.expiresAt).toLocaleString()}
          </p>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            size="lg"
          >
            {isJoining ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Join Session
              </>
            )}
          </Button>

          <Button variant="outline" asChild className="w-full border-white/20 text-gray-300 hover:bg-white/10">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Share this code with others to invite them to join:</p>
          <p className="font-mono text-white mt-1">{session.code}</p>
        </div>
      </div>
    </div>
  );
}
