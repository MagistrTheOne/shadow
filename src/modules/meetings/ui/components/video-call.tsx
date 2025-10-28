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
  useCall,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { MeetingChat, MeetingParticipants } from "./meeting-chat";
import { AIAvatarController } from "./ai-avatar-controller";
import { VoiceAgent } from "./voice-agent";
import { BackgroundEffects } from "./background-effects";
import { AudioTranscription } from "./audio-transcription";
import { VisionAI } from "./vision-ai";
import { ScreenSharing } from "./screen-sharing";
import { ParticipantManagement } from "./participant-management";
import { trpc } from "@/trpc/client";

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
  const [showChat, setShowChat] = useState(false);
  const [aiAvatarVisible, setAiAvatarVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAgentEnabled, setVoiceAgentEnabled] = useState(false);
  const [backgroundEffectsEnabled, setBackgroundEffectsEnabled] = useState(false);
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  const [visionAIEnabled, setVisionAIEnabled] = useState(false);
  const [screenSharingEnabled, setScreenSharingEnabled] = useState(false);
  const [participantManagementEnabled, setParticipantManagementEnabled] = useState(false);

  // Получаем данные митинга
  const { data: meeting } = trpc.meetings.getById.useQuery({ id: callId });

  // Получаем call объект для управления записью
  const call = useCall();

  // Моковые данные участников
  const participants = [
    { id: '1', name: 'John Smith', isOnline: true },
    { id: '2', name: 'AI Assistant', isOnline: true },
  ];

  const handleStartRecording = async () => {
    if (call) {
      try {
        await call.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    }
  };

  const handleStopRecording = async () => {
    if (call) {
      try {
        await call.stopRecording();
        setIsRecording(false);
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
  };

  return (
    <div className="h-full w-full flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <SpeakerLayout />
          
        </div>
        
        <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
          <CallControls />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>

            <button
              onClick={() => setVoiceAgentEnabled(!voiceAgentEnabled)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                voiceAgentEnabled
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {voiceAgentEnabled ? 'Disable Voice Agent' : 'Enable Voice Agent'}
            </button>

            <button
              onClick={() => setBackgroundEffectsEnabled(!backgroundEffectsEnabled)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                backgroundEffectsEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {backgroundEffectsEnabled ? 'Disable Effects' : 'Enable Effects'}
            </button>

            <button
              onClick={() => setVisionAIEnabled(!visionAIEnabled)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                visionAIEnabled
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {visionAIEnabled ? 'Disable Vision AI' : 'Enable Vision AI'}
            </button>

            <button
              onClick={() => setScreenSharingEnabled(!screenSharingEnabled)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                screenSharingEnabled
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {screenSharingEnabled ? 'Disable Screen Share' : 'Enable Screen Share'}
            </button>

            <button
              onClick={() => setParticipantManagementEnabled(!participantManagementEnabled)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                participantManagementEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {participantManagementEnabled ? 'Disable Participants' : 'Enable Participants'}
            </button>

            <button
              onClick={() => setAiAvatarVisible(!aiAvatarVisible)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                aiAvatarVisible
                  ? 'bg-orange-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {aiAvatarVisible ? 'Hide AI Assistant' : 'Show AI Assistant'}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showChat
                  ? 'bg-cyan-600 text-white'
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
        agentId={meeting?.agentId || undefined}
      />

      {/* Voice Agent */}
      <VoiceAgent
        callId={callId}
        callType="default"
        isEnabled={voiceAgentEnabled}
        onToggle={() => setVoiceAgentEnabled(!voiceAgentEnabled)}
      />

      {/* Background Effects */}
      <BackgroundEffects
        isEnabled={backgroundEffectsEnabled}
        onToggle={() => setBackgroundEffectsEnabled(!backgroundEffectsEnabled)}
      />

      {/* Audio Transcription */}
      <AudioTranscription
        isEnabled={transcriptionEnabled}
        onToggle={() => setTranscriptionEnabled(!transcriptionEnabled)}
      />

      {/* Vision AI */}
      <VisionAI
        isEnabled={visionAIEnabled}
        onToggle={() => setVisionAIEnabled(!visionAIEnabled)}
      />

      {/* Screen Sharing */}
      <ScreenSharing
        isEnabled={screenSharingEnabled}
        onToggle={() => setScreenSharingEnabled(!screenSharingEnabled)}
      />

      {/* Participant Management */}
      <ParticipantManagement
        isEnabled={participantManagementEnabled}
        onToggle={() => setParticipantManagementEnabled(!participantManagementEnabled)}
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