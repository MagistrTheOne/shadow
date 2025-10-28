"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Edit, 
  Trash2, 
  Play, 
  ArrowLeft,
  Calendar,
  Clock,
  Bot,
  Users,
  Copy,
  Share,
  MessageSquare,
  FileText,
  Download
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

interface MeetingDetailPageProps {
  params: { id: string };
}

export default function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: meeting, isLoading, isError } = trpc.meetings.getOne.useQuery({ id: params.id });

  const deleteMeeting = trpc.meetings.delete.useMutation({
    onSuccess: () => {
      toast.success("Meeting deleted successfully!");
      router.push("/dashboard/meetings");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete meeting");
      setIsDeleting(false);
    },
  });

  const startMeeting = trpc.meetings.start.useMutation({
    onSuccess: () => {
      toast.success("Meeting started!");
      router.push(`/dashboard/meetings/${params.id}/call`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start meeting");
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      setIsDeleting(true);
      deleteMeeting.mutate({ id: params.id });
    }
  };

  const handleStartMeeting = () => {
    startMeeting.mutate({ id: params.id });
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/dashboard/meetings/${params.id}/call`;
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard!");
  };

  const getMeetingStatus = () => {
    if (meeting?.status === "active") return { text: "Live", color: "bg-red-500/20 text-red-400 border-red-400/30" };
    if (meeting?.status === "completed") return { text: "Completed", color: "bg-green-500/20 text-green-400 border-green-400/30" };
    if (meeting?.status === "cancelled") return { text: "Cancelled", color: "bg-gray-500/20 text-gray-400 border-gray-400/30" };
    return { text: "Scheduled", color: "bg-blue-500/20 text-blue-400 border-blue-400/30" };
  };

  if (isLoading) {
    return (
      <div className="py-6 px-4 md:px-8">
        <LoadingState
          title="Loading meeting..."
          description="Fetching meeting details"
        />
      </div>
    );
  }

  if (isError || !meeting) {
    return (
      <div className="py-6 px-4 md:px-8">
        <ErrorState
          title="Meeting not found"
          description="The meeting you're looking for doesn't exist or you don't have permission to access it."
        />
      </div>
    );
  }

  const status = getMeetingStatus();

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/meetings">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Meetings
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{meeting.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={status.color}>
                    {status.text}
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    Created {format(new Date(meeting.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {meeting.status === "scheduled" && (
              <Button 
                onClick={handleStartMeeting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Meeting
              </Button>
            )}
            {meeting.status === "active" && (
              <Button 
                asChild
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Link href={`/dashboard/meetings/${meeting.id}/call`}>
                  <Play className="w-4 h-4 mr-2" />
                  Join Meeting
                </Link>
              </Button>
            )}
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href={`/dashboard/meetings/${meeting.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {meeting.description && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{meeting.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Meeting Details */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>
                      {meeting.scheduledAt 
                        ? format(new Date(meeting.scheduledAt), "MMM dd, yyyy 'at' HH:mm")
                        : "No date set"
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span>{meeting.duration || 60} minutes</span>
                  </div>
                </div>
                
                {meeting.agentId && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>AI Agent will be present</span>
                  </div>
                )}

                {meeting.isRecurring && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span>Recurring meeting ({meeting.recurringType})</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meeting Timeline */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Meeting created</p>
                      <p className="text-gray-400 text-xs">{format(new Date(meeting.createdAt), "MMM dd, yyyy 'at' HH:mm")}</p>
                    </div>
                  </div>
                  
                  {meeting.startedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm">Meeting started</p>
                        <p className="text-gray-400 text-xs">{format(new Date(meeting.startedAt), "MMM dd, yyyy 'at' HH:mm")}</p>
                      </div>
                    </div>
                  )}
                  
                  {meeting.endedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm">Meeting ended</p>
                        <p className="text-gray-400 text-xs">{format(new Date(meeting.endedAt), "MMM dd, yyyy 'at' HH:mm")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {meeting.status === "scheduled" && (
                  <Button 
                    onClick={handleStartMeeting}
                    className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Meeting
                  </Button>
                )}
                {meeting.status === "active" && (
                  <Button 
                    asChild
                    className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Link href={`/dashboard/meetings/${meeting.id}/call`}>
                      <Play className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Link>
                  </Button>
                )}
                <Button 
                  onClick={copyMeetingLink}
                  variant="outline" 
                  className="w-full justify-start border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full justify-start border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <Link href={`/dashboard/meetings/${meeting.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Meeting
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Meeting Info */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Meeting Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Host: You</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Created {format(new Date(meeting.createdAt), "MMM dd, yyyy")}</span>
                </div>
                {meeting.updatedAt && meeting.updatedAt !== meeting.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Updated {format(new Date(meeting.updatedAt), "MMM dd, yyyy")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meeting Resources */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Transcript
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Recording
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}