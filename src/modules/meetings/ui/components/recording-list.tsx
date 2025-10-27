"use client";

import { useTRPC } from "@/trpc/cleint";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, DownloadIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { useState } from "react";
import { toast } from "sonner";

interface RecordingListProps {
  meetingId: string;
}

export const RecordingList = ({ meetingId }: RecordingListProps) => {
  const trpc = useTRPC();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { data: recordings, isLoading, isError, error } = useSuspenseQuery(
    trpc.recordings.getByMeeting.queryOptions({ meetingId })
  );

  const handleDelete = async (recordingId: string) => {
    setIsDeleting(recordingId);
    try {
      // TODO: Implement delete functionality
      console.log('Delete recording:', recordingId);
      toast.success("Recording deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete recording", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (recordingId: string) => {
    try {
      // TODO: Implement download functionality
      console.log('Download recording:', recordingId);
      toast.success("Download started");
    } catch (error: any) {
      toast.error("Failed to get download URL", {
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  if (isLoading) return <LoadingState title="Loading recordings..." description="Fetching meeting recordings." />;
  if (isError) return <ErrorState title="Error loading recordings" description={error?.message || "Something went wrong."} />;

  if (!recordings || recordings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <PlayIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No recordings found</p>
        <p className="text-sm">Recordings will appear here after the meeting ends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recordings.map((recording) => (
        <Card key={recording.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Recording {format(recording.createdAt, 'MMM dd, yyyy HH:mm')}
              <Badge variant={recording.status === "ready" ? "default" : "secondary"}>
                {recording.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Duration: {recording.duration ? `${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}
              </div>
              <div className="flex gap-2">
                {recording.status === "ready" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(recording.id)}
                    >
                      <DownloadIcon className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(recording.fileUrl, '_blank')}
                    >
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                  </>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(recording.id)}
                  disabled={isDeleting === recording.id}
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};