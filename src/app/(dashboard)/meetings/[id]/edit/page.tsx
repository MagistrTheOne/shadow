"use client";

import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingEditForm } from "@/modules/meetings/ui/components/meeting-edit-form";
import { useRouter } from "next/navigation";

interface MeetingEditPageProps {
  params: {
    id: string;
  };
}

const MeetingEditView = ({ meetingId }: { meetingId: string }) => {
  const router = useRouter();
  const { data: meeting, isLoading, isError, error } = trpc.meetings.getOne.useQuery({ id: meetingId });

  if (isLoading) return <LoadingState title="Loading meeting..." description="Fetching meeting details." />;
  if (isError) return <ErrorState title="Error loading meeting" description={error?.message || "Something went wrong."} />;
  if (!meeting) return <ErrorState title="Meeting not found" description="The requested meeting could not be found." />;

  const handleSuccess = () => {
    router.push(`/meetings/${meetingId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Meeting</h1>
          <p className="text-gray-400">Update your meeting details and settings</p>
        </div>
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-8">
            <MeetingEditForm
              meetingId={meetingId}
              initialData={{
                title: meeting.title,
                description: meeting.description || "",
                scheduledAt: meeting.scheduledAt,
              }}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MeetingEditPage = ({ params }: MeetingEditPageProps) => {
  return (
    <Suspense fallback={<LoadingState title="Loading meeting..." description="Fetching meeting details." />}>
      <MeetingEditView meetingId={params.id} />
    </Suspense>
  );
};

export default MeetingEditPage;
