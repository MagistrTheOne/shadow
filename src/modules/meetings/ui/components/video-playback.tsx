"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, Maximize, Search } from "lucide-react";
import { trpc } from "@/trpc/client";
import { format } from "date-fns";

interface VideoPlaybackProps {
  recordingId: string;
  meetingId: string;
}

export function VideoPlayback({ recordingId, meetingId }: VideoPlaybackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const { data: recording } = trpc.recordings.getOne.useQuery({ id: recordingId });
  const { data: transcript } = trpc.transcripts.getByMeeting.useQuery({ meetingId });
  const { data: summary } = transcript ? trpc.transcripts.getSummary.useQuery({ 
    transcriptId: transcript.id 
  }) : { data: null };

  // Split transcript into time-based segments (simplified - would need actual timestamps)
  const transcriptSegments = transcript?.content
    ? transcript.content.split(/\n+/).filter((line: string) => line.trim())
    : [];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleTimeClick = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!recording || !transcript) {
    return (
      <Card className="dashboard-card">
        <CardContent>Loading recording...</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>{recording.meeting.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={recording.fileUrl}
                className="w-full aspect-video"
                controls
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-black/70 rounded px-3 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex-1 text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                <Volume2 className="w-4 h-4 text-white" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setVolume(vol);
                    if (videoRef.current) {
                      videoRef.current.volume = vol;
                    }
                  }}
                  className="w-20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {summary && (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Meeting Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-strong whitespace-pre-wrap">
                {summary.summary.summary}
              </p>
              {summary.summary.keyPoints && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Key Points</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-strong">
                    {(summary.summary.keyPoints as string[]).map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transcript Sidebar */}
      <div>
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {transcriptSegments.map((segment, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      highlightIndex === index
                        ? "bg-primary/20 border border-primary"
                        : "dashboard-surface hover:bg-dashboard-accent/10"
                    }`}
                    onClick={() => {
                      // Calculate approximate time (would need real timestamps)
                      const estimatedTime = (index / transcriptSegments.length) * duration;
                      handleTimeClick(estimatedTime);
                      setHighlightIndex(index);
                    }}
                  >
                    <p className="text-sm text-muted-strong">{segment}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

