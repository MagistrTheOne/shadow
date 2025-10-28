"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Plus, 
  Play, 
  Calendar, 
  Clock, 
  Bot, 
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Share
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { animations } from "@/lib/animations";

export default function MeetingsPage() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: meetings, isLoading, isError, refetch } = trpc.meetings.getMany.useQuery({});

  const deleteMeeting = trpc.meetings.delete.useMutation({
    onSuccess: () => {
      toast.success("Meeting deleted successfully");
      refetch();
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete meeting");
      setDeletingId(null);
    },
  });

  const startMeeting = trpc.meetings.start.useMutation({
    onSuccess: (data) => {
      toast.success("Meeting started!");
      router.push(`/dashboard/meetings/${data.id}/call`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start meeting");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      setDeletingId(id);
      deleteMeeting.mutate({ id });
    }
  };

  const handleStartMeeting = (id: string) => {
    startMeeting.mutate({ id });
  };

  const copyMeetingLink = (id: string) => {
    const link = `${window.location.origin}/dashboard/meetings/${id}/call`;
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard!");
  };

  const getMeetingStatus = (meeting: any) => {
    if (meeting.status === "active") return { text: "Live", color: "bg-red-500/20 text-red-400 border-red-400/30" };
    if (meeting.status === "completed") return { text: "Completed", color: "bg-green-500/20 text-green-400 border-green-400/30" };
    if (meeting.status === "cancelled") return { text: "Cancelled", color: "bg-gray-500/20 text-gray-400 border-gray-400/30" };
    return { text: "Scheduled", color: "bg-blue-500/20 text-blue-400 border-blue-400/30" };
  };

  const getMeetingDate = (meeting: any) => {
    if (!meeting.scheduledAt) return "No date set";
    
    const date = new Date(meeting.scheduledAt);
    if (isToday(date)) return `Today at ${format(date, "HH:mm")}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, "HH:mm")}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, "HH:mm")}`;
    return format(date, "MMM dd, yyyy 'at' HH:mm");
  };

  const groupMeetingsByDate = (meetings: any[]) => {
    const groups: { [key: string]: any[] } = {
      "Today": [],
      "Tomorrow": [],
      "This Week": [],
      "Later": [],
    };

    meetings.forEach((meeting) => {
      if (!meeting.scheduledAt) {
        groups["Later"].push(meeting);
        return;
      }

      const date = new Date(meeting.scheduledAt);
      if (isToday(date)) {
        groups["Today"].push(meeting);
      } else if (isTomorrow(date)) {
        groups["Tomorrow"].push(meeting);
      } else if (date.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000) {
        groups["This Week"].push(meeting);
      } else {
        groups["Later"].push(meeting);
      }
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="py-6 px-4 md:px-8">
        <LoadingState
          title="Loading meetings..."
          description="Fetching your meetings"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6 px-4 md:px-8">
        <ErrorState
          title="Error loading meetings"
          description="Unable to fetch your meetings. Please try refreshing the page."
        />
      </div>
    );
  }

  const groupedMeetings = groupMeetingsByDate(meetings || []);

  return (
    <div className={`py-6 px-4 md:px-8 ${animations.pageEnter}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-8 ${animations.fadeInUp}`}>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meetings</h1>
          <p className="text-gray-400">Manage your AI-powered meetings</p>
        </div>
        <Button asChild className={`bg-blue-600 hover:bg-blue-700 text-white ${animations.buttonHover}`}>
          <Link href="/dashboard/meetings/new">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className={`grid gap-6 md:grid-cols-4 mb-8 ${animations.fadeInUp} ${animations.stagger2}`}>
        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.cardHover}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Meetings</p>
                <p className="text-2xl font-bold text-white">{meetings?.length || 0}</p>
              </div>
              <Video className={`h-8 w-8 text-blue-400 ${animations.iconPulse}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.cardHover}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Live Now</p>
                <p className="text-2xl font-bold text-white">
                  {meetings?.filter((m: any) => m.status === "active").length || 0}
                </p>
              </div>
              <Play className={`h-8 w-8 text-red-400 ${animations.iconBounce}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.cardHover}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-white">
                  {meetings?.filter((m: any) => m.status === "scheduled").length || 0}
                </p>
              </div>
              <Calendar className={`h-8 w-8 text-green-400 ${animations.iconSpin}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.cardHover}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {meetings?.filter((m: any) => m.status === "completed").length || 0}
                </p>
              </div>
              <Clock className={`h-8 w-8 text-purple-400 ${animations.iconPulse}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings by Date */}
      {meetings && meetings.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedMeetings).map(([groupName, groupMeetings]) => {
            if (groupMeetings.length === 0) return null;
            
            return (
              <div key={groupName} className={`${animations.fadeInUp} ${animations.stagger3}`}>
                <h2 className="text-xl font-semibold text-white mb-4">{groupName}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupMeetings.map((meeting: any, index: number) => {
                    const status = getMeetingStatus(meeting);
                    return (
                      <Card key={meeting.id} className={`bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200 ${animations.cardHover} ${animations.listItem} ${animations[`stagger${index + 1}` as keyof typeof animations]}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <Video className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                <CardTitle className="text-white text-lg">{meeting.title}</CardTitle>
                                <Badge className={status.color}>
                                  {status.text}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/meetings/${meeting.id}/edit`} className="text-white">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => copyMeetingLink(meeting.id)}
                                  className="text-white"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(meeting.id)}
                                  className="text-red-400"
                                  disabled={deletingId === meeting.id}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {deletingId === meeting.id ? "Deleting..." : "Delete"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {meeting.description && (
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{meeting.description}</p>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{getMeetingDate(meeting)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{meeting.duration || 60} minutes</span>
                            </div>
                            
                            {meeting.agentId && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Bot className="w-4 h-4" />
                                <span>AI Agent</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex gap-2">
                              {meeting.status === "scheduled" && (
                                <Button 
                                  size="sm" 
                                  className={`flex-1 bg-green-600 hover:bg-green-700 text-white ${animations.buttonHover}`}
                                  onClick={() => handleStartMeeting(meeting.id)}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Start
                                </Button>
                              )}
                              {meeting.status === "active" && (
                                <Button 
                                  size="sm" 
                                  className={`flex-1 bg-red-600 hover:bg-red-700 text-white ${animations.buttonHover}`}
                                  asChild
                                >
                                  <Link href={`/dashboard/meetings/${meeting.id}/call`}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Join
                                  </Link>
                                </Button>
                              )}
                              <Button asChild size="sm" variant="outline" className={`border-white/20 text-gray-300 hover:bg-white/10 ${animations.buttonHover}`}>
                                <Link href={`/dashboard/meetings/${meeting.id}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeIn}`}>
          <CardContent className="p-12 text-center">
            <Video className={`w-16 h-16 text-gray-400 mx-auto mb-4 ${animations.iconBounce}`} />
            <h3 className="text-xl font-semibold text-white mb-2">No meetings yet</h3>
            <p className="text-gray-400 mb-6">Schedule your first AI-powered meeting to get started.</p>
            <Button asChild className={`bg-blue-600 hover:bg-blue-700 text-white ${animations.buttonHover}`}>
              <Link href="/dashboard/meetings/new">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Meeting
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}