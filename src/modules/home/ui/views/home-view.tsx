"use client"

import { Suspense } from 'react';
import { useTRPC } from '@/trpc/cleint';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UsersIcon, PlusIcon, PlayIcon } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { LoadingState } from '@/components/loading-state';

export const HomeView = () => {
  const trpc = useTRPC();
  
  const { data: upcomingMeetings } = useSuspenseQuery(
    trpc.meetings.getUpcoming.queryOptions()
  );
  
  const { data: recentMeetings } = useSuspenseQuery(
    trpc.meetings.getHistory.queryOptions({ limit: 5, offset: 0 })
  );
  
  const { data: agents } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions()
  );

  return ( 
    <div className="py-4 px-4 md:px-8 flex flex-col gap-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-600">Manage your AI-powered meetings</p>
        </div>
        <Button asChild>
          <Link href="/meetings/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Meeting
          </Link>
        </Button>
       </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available agents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Meetings</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMeetings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMeetings && upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{meeting.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <CalendarIcon className="w-4 h-4" />
                      {meeting.scheduledAt && format(meeting.scheduledAt, 'MMM dd, HH:mm')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Scheduled</Badge>
                    <Button asChild size="sm">
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
            <div className="text-center py-6 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming meetings</p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/meetings/new">Schedule one</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMeetings && recentMeetings.length > 0 ? (
            <div className="space-y-3">
              {recentMeetings.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{meeting.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <ClockIcon className="w-4 h-4" />
                      {meeting.endedAt && format(meeting.endedAt, 'MMM dd, HH:mm')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Completed</Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/meetings/${meeting.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent meetings</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
   );
}
 
 