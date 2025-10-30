"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  Clock,
  HardDrive,
  FileText,
  TrendingUp,
  Calendar,
  Users,
  Video,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { format, subDays } from "date-fns";

export function MeetingAnalyticsDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const getDateRange = () => {
    const endDate = new Date();
    let startDate: Date;
    switch (period) {
      case "7d":
        startDate = subDays(endDate, 7);
        break;
      case "30d":
        startDate = subDays(endDate, 30);
        break;
      case "90d":
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = new Date(0); // All time
    }
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  const { data: analytics, isLoading } = trpc.meetings.getAnalytics.useQuery({
    startDate,
    endDate: period === "all" ? undefined : endDate,
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return <LoadingState title="Loading analytics..." description="Please wait" />;
  }

  if (!analytics) {
    return null;
  }

  const statusColors = {
    scheduled: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    active: "bg-green-500/20 text-green-300 border-green-400/30",
    completed: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-400/30",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-high-contrast">Meeting Analytics</h1>
          <p className="text-muted-strong mt-1">
            Insights and statistics for your meetings
          </p>
        </div>
        <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-strong">Total Meetings</p>
                <p className="text-2xl font-bold text-high-contrast mt-1">
                  {Object.values(analytics.meetings.byStatus).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <Video className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-strong">Total Duration</p>
                <p className="text-2xl font-bold text-high-contrast mt-1">
                  {formatDuration(analytics.meetings.totalDuration)}
                </p>
                <p className="text-xs text-muted-strong mt-1">
                  Avg: {formatDuration(analytics.meetings.avgDuration)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-strong">Storage Used</p>
                <p className="text-2xl font-bold text-high-contrast mt-1">
                  {formatBytes(analytics.recordings.totalStorageBytes)}
                </p>
                <p className="text-xs text-muted-strong mt-1">
                  {analytics.recordings.total} recordings
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-strong">Transcripts</p>
                <p className="text-2xl font-bold text-high-contrast mt-1">
                  {analytics.transcripts.total}
                </p>
                <p className="text-xs text-muted-strong mt-1">
                  {analytics.transcripts.totalWords.toLocaleString()} words
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Status Breakdown */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Meetings by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.meetings.byStatus).map(([status, count]) => (
              <div
                key={status}
                className={`p-4 rounded-lg border ${
                  statusColors[status as keyof typeof statusColors] || "bg-gray-500/20"
                }`}
              >
                <p className="text-sm font-medium capitalize mb-1">{status}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 dashboard-surface rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-strong">Total Meeting Time</span>
              </div>
              <span className="font-semibold text-high-contrast">
                {formatDuration(analytics.usage.totalDuration)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 dashboard-surface rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-muted-strong">Storage Used</span>
              </div>
              <span className="font-semibold text-high-contrast">
                {formatBytes(analytics.usage.totalStorageBytes)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 dashboard-surface rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-muted-strong">Words Transcribed</span>
              </div>
              <span className="font-semibold text-high-contrast">
                {analytics.usage.totalWords.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Recordings & Transcripts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 dashboard-surface rounded-lg">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-green-400" />
                <span className="text-sm text-muted-strong">Total Recordings</span>
              </div>
              <span className="font-semibold text-high-contrast">
                {analytics.recordings.total}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 dashboard-surface rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-muted-strong">Total Transcripts</span>
              </div>
              <span className="font-semibold text-high-contrast">
                {analytics.transcripts.total}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 dashboard-surface rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-muted-strong">Avg Meeting Duration</span>
              </div>
              <span className="font-semibold text-high-contrast">
                {formatDuration(analytics.meetings.avgDuration)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Info */}
      <Card className="dashboard-card">
        <CardContent className="p-4">
          <p className="text-sm text-muted-strong text-center">
            Period: {format(analytics.period.startDate, "MMM d, yyyy")} -{" "}
            {format(analytics.period.endDate, "MMM d, yyyy")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

