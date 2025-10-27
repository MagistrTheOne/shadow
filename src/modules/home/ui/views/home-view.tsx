"use client"

import { trpc } from '@/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UsersIcon, PlusIcon, PlayIcon, ZapIcon, BotIcon, VideoIcon } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import type { Meeting, Agent } from '@/trpc/types';

export const HomeView = () => {
  const { data: upcomingMeetings, isLoading: upcomingLoading } = trpc.meetings.getUpcoming.useQuery();
  const { data: recentMeetings, isLoading: recentLoading } = trpc.meetings.getHistory.useQuery({ limit: 5, offset: 0 });
  const { data: agents, isLoading: agentsLoading } = trpc.agents.getMany.useQuery();

  // Показываем загрузку если данные еще не загружены
  if (upcomingLoading || recentLoading || agentsLoading) {
    return (
      <div className="py-6 px-4 md:px-8 flex flex-col gap-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold text-white">{upcomingMeetings?.length || 0}</div>
            <p className="text-xs text-gray-400">
              Scheduled for today
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">AI Agents</CardTitle>
            <BotIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agents?.length || 0}</div>
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
            <div className="text-2xl font-bold text-white">{recentMeetings?.length || 0}</div>
            <p className="text-xs text-gray-400">
              Completed this week
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
          {upcomingMeetings && upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.slice(0, 3).map((meeting: Meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{meeting.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <CalendarIcon className="w-4 h-4" />
                      {meeting.scheduledAt && format(meeting.scheduledAt, 'MMM dd, HH:mm')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-gray-300 border-white/30">Scheduled</Badge>
                    <Button asChild size="sm" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                      <Link href={`/meetings/${meeting.id}/call`}>
                        <PlayIcon className="w-4 h-4 mr-1" />
                        Start
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No upcoming meetings</p>
              <p className="text-sm mb-4">Schedule your first AI-powered meeting</p>
              <Button asChild variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                <Link href="/meetings/new">Schedule one</Link>
              </Button>
            </div>
          )}
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
          {recentMeetings && recentMeetings.length > 0 ? (
            <div className="space-y-3">
              {recentMeetings.slice(0, 3).map((meeting: Meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{meeting.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <ClockIcon className="w-4 h-4" />
                      {meeting.endedAt && format(meeting.endedAt, 'MMM dd, HH:mm')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-gray-300 border-white/30">Completed</Badge>
                    <Button asChild variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
                      <Link href={`/meetings/${meeting.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No recent meetings</p>
              <p className="text-sm">Your meeting history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
   );
}
 
 