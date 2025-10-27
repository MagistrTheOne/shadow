"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, VideoIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { MeetingActionsDropdown } from "./meeting-actions-dropdown";
import type { Meeting } from "@/trpc/types";

export const MeetingList = () => {
  const { data: meetings, isLoading, isError, error } = trpc.meetings.getMany.useQuery({});

  if (isLoading) return <LoadingState title="Loading meetings..." description="Fetching your scheduled and past meetings." />;
  if (isError) return <ErrorState title="Error loading meetings" description={error?.message || "Something went wrong."} />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Meetings</h1>
          <p className="text-gray-400">Manage your AI-powered meeting sessions</p>
        </div>
        <Button asChild className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
          <Link href="/meetings/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Meeting
          </Link>
        </Button>
      </div>

      {meetings && meetings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting: Meeting) => (
            <Card key={meeting.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-white">{meeting.title}</span>
                  <div className="flex items-center gap-2">
                  <Badge className={
                    meeting.status === "scheduled"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-white/20 text-gray-300 border-white/30"
                  }>
                    {meeting.status}
                  </Badge>
                    <MeetingActionsDropdown
                      meeting={meeting}
                      onEdit={(meetingId) => {
                        // Handle edit - could navigate to edit page or open modal
                        window.location.href = `/meetings/${meetingId}/edit`;
                      }}
                      onDuplicate={async (meetingId) => {
                        // Handle duplicate - simplified
                        console.log('Duplicate meeting:', meetingId);
                        window.location.reload();
                      }}
                      onDelete={() => {
                        // Refetch meetings after delete
                        window.location.reload();
                      }}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">{meeting.description || "No description"}</p>
                {meeting.scheduledAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(meeting.scheduledAt, 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
                {meeting.status === "completed" && meeting.endedAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>Ended: {format(meeting.endedAt, 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  {meeting.status === "scheduled" && (
                    <Button asChild size="sm" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                      <Link href={`/meetings/${meeting.id}/call`}>
                        <VideoIcon className="w-4 h-4 mr-1" />
                        Start Call
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
                    <Link href={`/meetings/${meeting.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <VideoIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No meetings found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">Start your journey with AI-powered meetings. Create your first meeting to experience the future of collaboration.</p>
          <Button asChild className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
            <Link href="/meetings/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create New Meeting
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};