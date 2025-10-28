"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { animations } from "@/lib/animations";

export default function JoinSessionPage() {
  const router = useRouter();
  const [sessionCode, setSessionCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const joinSession = trpc.sessions.join.useMutation({
    onSuccess: (result) => {
      toast.success(result.joined ? "Successfully joined session!" : "Already in session");
      
      // Redirect based on session type
      if (result.session.type === "meeting") {
        router.push(`/dashboard/meetings/${result.session.id}/call`);
      } else if (result.session.type === "call") {
        router.push(`/dashboard/sessions/${result.session.id}/call`);
      } else if (result.session.type === "chat") {
        router.push(`/dashboard/sessions/${result.session.id}/chat`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setIsJoining(false);
    },
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim()) {
      toast.error("Please enter a session code");
      return;
    }

    setIsJoining(true);
    joinSession.mutate({ code: sessionCode.trim().toUpperCase() });
  };

  return (
    <div className={`py-6 px-4 md:px-8 max-w-md mx-auto ${animations.pageEnter}`}>
      <div className="mb-6">
        <Button variant="ghost" asChild className="text-gray-400 hover:text-white mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold text-white mb-2">Join Session</h1>
        <p className="text-gray-400">Enter the session code to join a meeting, call, or chat</p>
      </div>

      <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeInUp}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Enter Session Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionCode" className="text-white">
                Session Code
              </Label>
              <Input
                id="sessionCode"
                type="text"
                placeholder="e.g., ABC123DEF4"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                maxLength={11}
                disabled={isJoining}
              />
              <p className="text-xs text-gray-500">
                Enter the 9-11 character session code shared by the host
              </p>
            </div>

            <Button
              type="submit"
              disabled={isJoining || !sessionCode.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Join Session
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">How to get a session code:</p>
                <ul className="text-xs space-y-1 text-blue-300">
                  <li>• Ask the host to share their session code</li>
                  <li>• Look for the code in meeting invitations</li>
                  <li>• Check your calendar or meeting details</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
