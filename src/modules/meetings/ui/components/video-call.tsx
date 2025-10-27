"use client";

import {
  StreamVideo,
  StreamVideoClient,
  Call,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { SmartAvatar } from "@/components/smart-avatar";
import { MeetingChat, MeetingParticipants } from "./meeting-chat";
import { AIAvatarController } from "./ai-avatar-controller";

interface VideoCallProps {
  callId: string;
}

export const VideoCall = ({ callId }: VideoCallProps) => {
  const { data: user } = authClient.useSession();
  const router = useRouter();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const streamClient = getStreamVideoClient(user.user.id, user.user.name || "Guest");
    setClient(streamClient);

    const newCall = streamClient.call('default', callId);
    setCall(newCall);

    newCall.join().catch((err: any) => {
      console.error("Failed to join call", err);
    });

    return () => {
      newCall.leave().catch((err: any) => console.error("Failed to leave call", err));
      streamClient.disconnectUser();
    };
  }, [user, callId, router]);

  if (!client || !call) {
    return <LoadingState title="Setting up call..." description="Please wait" />;
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <div className="h-screen w-full">
          <CallUI callId={callId} />
        </div>
      </StreamTheme>
    </StreamVideo>
  );
};

const CallUI = ({ callId }: { callId: string }) => {
  const [showAIAvatar, setShowAIAvatar] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [aiAvatarVisible, setAiAvatarVisible] = useState(false);

  // Моковые данные участников
  const participants = [
    { id: '1', name: 'John Smith', isOnline: true },
    { id: '2', name: 'AI Assistant', isOnline: true },
  ];

  return (
    <div className="h-full w-full flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <SpeakerLayout />
          
          {/* AI Avatar Overlay */}
          {showAIAvatar && (
            <div className="absolute top-4 right-4 w-80 h-60 z-10">
              <SmartAvatar
                apiKey={process.env.NEXT_PUBLIC_HEYGEN_API_KEY || ''}
                meetingId={callId}
                meetingType="business"
                onReady={() => console.log('Smart Avatar ready')}
                onError={(error) => console.error('Smart Avatar error:', error)}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
          <CallControls />

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAiAvatarVisible(!aiAvatarVisible)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                aiAvatarVisible
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {aiAvatarVisible ? 'Hide AI Assistant' : 'Show AI Assistant'}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showChat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="w-80 border-l border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/10">
              <MeetingParticipants participants={participants} />
            </div>
            <div className="flex-1">
              <MeetingChat 
                meetingId={callId} 
                participants={participants}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Avatar Controller */}
      <AIAvatarController
        meetingId={callId}
        isVisible={aiAvatarVisible}
        onToggle={() => setAiAvatarVisible(!aiAvatarVisible)}
        agentId="default-agent" // TODO: Get from meeting data
      />
    </div>
  );
};

// Функция для получения Stream Video клиента
const getStreamVideoClient = (userId: string, userName: string): StreamVideoClient => {
  const client = new StreamVideoClient({
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    user: {
      id: userId,
      name: userName,
    },
    tokenProvider: async () => {
      const response = await fetch('/api/stream/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get Stream token');
      }
      
      const { token } = await response.json();
      return token;
    },
  });

  return client;
};