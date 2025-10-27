import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, BotIcon, VideoIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { format } from "date-fns";

const DashboardContent = () => {
  const { data: upcomingMeetings } = trpc.meetings.getUpcoming.useQuery();
  const { data: agents } = trpc.agents.getMany.useQuery();
  const { data: recentMeetings } = trpc.meetings.getHistory.useQuery({ limit: 3 });
  const { data: subscription } = trpc.subscriptions.getCurrent.useQuery();

  // Calculate stats
  const upcomingCount = upcomingMeetings?.length || 0;
  const agentsCount = agents?.length || 0;
  const recentCount = recentMeetings?.length || 0;

  return (
    <div className="py-6 px-4 md:px-8 flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
          <p className="text-gray-400">Manage your enterprise AI-powered meetings with intelligent avatars</p>
        </div>
        <Button asChild className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
          <Link href="/meetings/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Meeting
          </Link>
        </Button>
       </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Upcoming Meetings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{upcomingCount}</div>
            <p className="text-xs text-gray-400">
              Upcoming meetings
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">AI Agents</CardTitle>
            <BotIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agentsCount}</div>
            <p className="text-xs text-gray-400">
              Available agents
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Recent Meetings</CardTitle>
            <ClockIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{recentCount}</div>
            <p className="text-xs text-gray-400">
              Recent meetings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <VideoIcon className="w-5 h-5 text-blue-400" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingMeetings && upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
              <div className="flex-1">
                    <h4 className="font-medium text-white">{meeting.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <CalendarIcon className="w-4 h-4" />
                      {meeting.scheduledAt
                        ? format(new Date(meeting.scheduledAt), "MMM dd, yyyy 'at' HH:mm")
                        : "Scheduled"
                      }
                </div>
              </div>
              <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-400/30">
                      {meeting.status}
                    </span>
                <Button asChild size="sm" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                      <Link href={`/meetings/${meeting.id}/call`}>
                    Start
                  </Link>
                </Button>
              </div>
            </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No upcoming meetings</p>
                <Button size="sm" className="mt-2" asChild>
                  <Link href="/meetings/new">Schedule Meeting</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Meetings */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-green-400" />
            Recent Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
              <div className="flex-1">
                <h4 className="font-medium text-white">Project Planning Session</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <ClockIcon className="w-4 h-4" />
                  2 days ago, 1h duration
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-400/30">Completed</span>
                <Button asChild variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
                  <Link href="/meetings/project-planning">View</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
              <div className="flex-1">
                <h4 className="font-medium text-white">AI Integration Review</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <ClockIcon className="w-4 h-4" />
                  1 week ago, 45m duration
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-400/30">Completed</span>
                <Button asChild variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
                  <Link href="/meetings/ai-integration-review">View</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<LoadingState title="Loading dashboard..." description="Fetching your data" />}>
      <DashboardContent />
    </Suspense>
  );
};
 
export default Page;