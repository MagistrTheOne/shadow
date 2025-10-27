import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, BotIcon, VideoIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Welcome back, {session.user.name || session.user.email}!</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Meetings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-gray-400">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Agents</CardTitle>
            <BotIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3</div>
            <p className="text-xs text-gray-400">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Hours Recorded</CardTitle>
            <VideoIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24.5</div>
            <p className="text-xs text-gray-400">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Duration</CardTitle>
            <ClockIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">45m</div>
            <p className="text-xs text-gray-400">Per meeting</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Team Standup</p>
                  <p className="text-gray-400 text-sm">2 hours ago</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Client Presentation</p>
                  <p className="text-gray-400 text-sm">Yesterday</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BotIcon className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <VideoIcon className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
