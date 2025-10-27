"use client";

import { useTRPC } from "@/trpc/cleint";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, VideoIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

export const MeetingList = () => {
  const trpc = useTRPC();
  const { data: meetings, isLoading, isError, error } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions()
  );

  if (isLoading) return <LoadingState title="Loading meetings..." description="Fetching your scheduled and past meetings." />;
  if (isError) return <ErrorState title="Error loading meetings" description={error?.message || "Something went wrong."} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Meetings</h1>
        <Button asChild>
          <Link href="/meetings/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Meeting
          </Link>
        </Button>
      </div>

      {meetings && meetings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {meeting.title}
                  <Badge variant={meeting.status === "scheduled" ? "default" : "secondary"}>
                    {meeting.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">{meeting.description || "No description"}</p>
                {meeting.scheduledAt && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(meeting.scheduledAt, 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
                {meeting.status === "completed" && meeting.endedAt && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>Ended: {format(meeting.endedAt, 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  {meeting.status === "scheduled" && (
                    <Button asChild size="sm">
                      <Link href={`/meetings/${meeting.id}/call`}>
                        <VideoIcon className="w-4 h-4 mr-1" />
                        Start Call
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/meetings/${meeting.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <VideoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No meetings found.</p>
          <p className="text-sm">Start by creating a new meeting.</p>
          <Button asChild className="mt-4">
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