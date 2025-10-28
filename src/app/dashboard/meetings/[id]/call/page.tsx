"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Users,
  Settings,
  Share,
  MoreVertical,
  Bot,
  MessageSquare,
  Calendar,
  Clock,
  Maximize,
  Minimize,
  Copy,
  Check,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { usePresence } from "@/hooks/use-presence";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MeetingCallPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingCallPage({ params }: MeetingCallPageProps) {
  const { id } = await params;
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const { data: meeting, isLoading, isError } = trpc.meetings.getOne.useQuery({ id });
  const { data: meetingAgents } = trpc.meetingAgents.getByMeeting.useQuery({ meetingId: id });
  const { data: session, isLoading: sessionLoading } = trpc.sessions.getByMeetingId.useQuery({ meetingId: id });
  const { data: messages, refetch: refetchMessages } = trpc.sessionMessages.list.useQuery(
    { sessionId: session?.id || "" },
    { enabled: !!session?.id }
  );
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);

  // Initialize presence system
  const { updateRichPresence } = usePresence();

  const endMeeting = trpc.meetings.end.useMutation({
    onSuccess: () => {
      toast.success("Meeting ended");
      router.push("/dashboard/meetings");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to end meeting");
      setIsLeaving(false);
    },
  });

  const sendMessage = trpc.sessionMessages.send.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const backfillSessions = trpc.sessions.backfillForMeetings.useMutation({
    onSuccess: (result) => {
      toast.success(`Created ${result.created} sessions for existing meetings`);
      setIsBackfilling(false);
      // Refetch session data
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to backfill sessions");
      setIsBackfilling(false);
    },
  });

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error("Unable to access camera or microphone");
      }
    };

    initMedia();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Update rich presence when joining/leaving meeting
  useEffect(() => {
    if (meeting) {
      // Set rich presence to "in meeting"
      updateRichPresence({
        type: "meeting",
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        sessionCode: session?.code,
      });
    }

    return () => {
      // Clear rich presence when leaving
      updateRichPresence(null);
    };
  }, [meeting, session, updateRichPresence]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Microphone enabled" : "Microphone muted");
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast.success(isVideoOff ? "Camera enabled" : "Camera disabled");
  };

  const handleLeaveMeeting = () => {
    setIsLeaving(true);
    endMeeting.mutate({ id });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const shareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success("Screen sharing started");
    } catch (error) {
      toast.error("Failed to start screen sharing");
    }
  };

  const copySessionCode = async () => {
    if (session?.code) {
      try {
        await navigator.clipboard.writeText(session.code);
        setCopiedCode(true);
        toast.success("Session code copied to clipboard");
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        toast.error("Failed to copy session code");
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && session?.id) {
      sendMessage.mutate({
        sessionId: session.id,
        content: newMessage.trim(),
      });
    }
  };

  const handleBackfill = () => {
    setIsBackfilling(true);
    backfillSessions.mutate();
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (isError || !meeting) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Meeting not found</h1>
          <p className="text-gray-400 mb-6">The meeting you're looking for doesn't exist or has ended.</p>
          <Button asChild>
            <Link href="/dashboard/meetings">Back to Meetings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-white">{meeting.title}</h1>
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
            Live
          </Badge>
          {session && (
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
              <span className="text-white text-sm font-mono">{session.code}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={copySessionCode}
                className="h-6 w-6 p-0 text-gray-300 hover:text-white"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          )}
          {!session && !sessionLoading && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleBackfill}
              disabled={isBackfilling}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              {isBackfilling ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Create Session
                </>
              )}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-gray-300 hover:text-white hover:bg:white/10"
          >
            <Users className="w-4 h-4 mr-2" />
            Participants
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-gray-300 hover:text:white hover:bg:white/10"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
              <DropdownMenuItem onClick={shareScreen} className="text-white">
                <Share className="w-4 h-4 mr-2" />
                Share Screen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? (
                  <>
                    <Minimize className="w-4 h-4 mr-2" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4 mr-2" />
                    Fullscreen
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gray-900">
            <video ref={videoRef} autoPlay muted={isMuted} className="w-full h-full object-cover" />

            {/* AI Agent Overlay */}
            {meetingAgents && meetingAgents.length > 0 && (
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items:center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm">{meetingAgents.length} AI Agent{meetingAgents.length > 1 ? 's' : ''} Active</span>
                </div>
              </div>
            )}

            {/* Meeting Info Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(meeting.createdAt), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{meeting.duration || 60} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-gray-900 border-l border-white/10 flex flex-col">
            {showParticipants && (
              <div className="flex-1 p-4">
                <h3 className="text-white font-semibold mb-4">Participants</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items:center justify-center">
                      <span className="text-white text-sm font-medium">Y</span>
                    </div>
                    <span className="text-white text-sm">You</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs">Host</Badge>
                  </div>
                  {meetingAgents && meetingAgents.length > 0 && (
                    <div className="space-y-2">
                      {meetingAgents.map((ma) => (
                        <div key={ma.id} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items:center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white text-sm">{ma.agent.name}</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs">{ma.role}</Badge>
                          <Badge className={ma.isActive ? "bg-green-500/20 text-green-400 border-green-400/30 text-xs" : "bg-red-500/20 text-red-400 border-red-400/30 text-xs"}>
                            {ma.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {showChat && (
              <div className="flex-1 p-4 flex flex-col">
                <h3 className="text-white font-semibold mb-4">Chat</h3>
                <div className="flex-1 bg-white/5 rounded-lg p-3 mb-4 overflow-y-auto max-h-64">
                  <div className="space-y-3">
                    {messages?.messages && messages.messages.length > 0 ? (
                      messages.messages.map((msg) => (
                        <div key={msg.id} className="text-gray-400 text-sm">
                          <span className={msg.sender?.type === "user" ? "text-green-400" : "text-blue-400"}>
                            {msg.sender?.type === "user" ? "You" : msg.sender?.name || "System"}:
                          </span>{" "}
                          {msg.content}
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(msg.createdAt), "HH:mm")}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm text-center py-4">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder:text-gray-400 text-sm"
                    disabled={!session || sendMessage.isPending}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!session || !newMessage.trim() || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            variant={isMuted ? "destructive" : "outline"}
            onClick={toggleMute}
            className={isMuted ? "bg-red-600 hover:bg-red-700 text-white" : "border-white/20 text-white hover:bg-white/10"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            size="lg"
            variant={isVideoOff ? "destructive" : "outline"}
            onClick={toggleVideo}
            className={isVideoOff ? "bg-red-600 hover:bg-red-700 text-white" : "border-white/20 text-white hover:bg-white/10"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>

          <Button
            size="lg"
            variant="destructive"
            onClick={handleLeaveMeeting}
            disabled={isLeaving}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLeaving ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Leaving...
              </>
            ) : (
              <>
                <PhoneOff className="w-5 h-5 mr-2" />
                Leave Meeting
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
