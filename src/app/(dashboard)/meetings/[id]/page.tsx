"use client";

import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, VideoIcon, BotIcon, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MeetingDeleteDialog } from "@/modules/meetings/ui/components/meeting-delete-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MeetingDetailsPageProps {
  params: {
    id: string;
  };
}

const MeetingDetailsView = ({ meetingId }: { meetingId: string }) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: meeting, isLoading, isError, error } = trpc.meetings.getOne.useQuery({ id: meetingId });

  if (isLoading) return <LoadingState title="Loading meeting details..." description="Fetching meeting information." />;
  if (isError) return <ErrorState title="Error loading meeting" description={error?.message || "Something went wrong."} />;
  if (!meeting) return <ErrorState title="Meeting not found" description="The requested meeting could not be found." />;

  const handleEdit = () => {
    router.push(`/meetings/${meetingId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    router.push("/meetings");
  };

  return (
    <div className="space-y-6">
      {/* Meeting Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{meeting.title}</CardTitle>
          <Badge variant={meeting.status === "scheduled" ? "default" : "secondary"}>
            {meeting.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{meeting.description || "No description provided."}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meeting.scheduledAt && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                <span>Scheduled: {format(meeting.scheduledAt, 'PPP HH:mm')}</span>
              </div>
            )}
            {meeting.startedAt && (
              <div className="flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-muted-foreground" />
                <span>Started: {format(meeting.startedAt, 'PPP HH:mm')}</span>
              </div>
            )}
            {meeting.endedAt && (
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-muted-foreground" />
                <span>Ended: {format(meeting.endedAt, 'PPP HH:mm')}</span>
              </div>
            )}
            {meeting.agentId && (
              <div className="flex items-center gap-2">
                <BotIcon className="w-5 h-5 text-muted-foreground" />
                <span>Agent: {meeting.agentId}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            {meeting.status === "scheduled" && (
              <Button asChild>
                <Link href={`/meetings/${meeting.id}/call`}>Start Call</Link>
              </Button>
            )}
            {meeting.status === "completed" && (
              <Button asChild variant="outline">
                <Link href={`/meetings/${meeting.id}/recording`}>View Recording</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>


      <MeetingDeleteDialog
        meetingId={meetingId}
        meetingTitle={meeting.title}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

const MeetingDetailsPage = ({ params }: MeetingDetailsPageProps) => {
  return (
    <div className="py-4 px-4 md:px-8">
      <Suspense fallback={<LoadingState title="Loading meeting details..." description="Fetching meeting information." />}>
        <MeetingDetailsView meetingId={params.id} />
      </Suspense>
    </div>
  );
};

export default MeetingDetailsPage;