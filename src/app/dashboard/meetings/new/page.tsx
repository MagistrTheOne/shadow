"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Clock, Bot, Users, Video, Save } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  agentId: z.string().optional(),
  scheduledAt: z.date().optional(),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(480, "Duration must be less than 8 hours"),
  isRecurring: z.boolean(),
  recurringType: z.enum(["daily", "weekly", "monthly"]).optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
  { value: 480, label: "8 hours" },
];

const RECURRING_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function CreateMeetingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateMeetingContent />
    </Suspense>
  );
}

function CreateMeetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      duration: 60,
      isRecurring: false,
    },
  });

  const { data: agents } = trpc.agents.getMany.useQuery();

  const createMeeting = trpc.meetings.create.useMutation({
    onSuccess: () => {
      toast.success("Meeting created successfully!");
      router.push("/dashboard/meetings");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create meeting");
      setIsCreating(false);
    },
  });

  useEffect(() => {
    const agentId = searchParams.get('agent');
    if (agentId) {
      setValue('agentId', agentId);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: MeetingFormData) => {
    setIsCreating(true);
    createMeeting.mutate({
      ...data,
      scheduledAt: selectedDate,
    });
  };

  const watchedIsRecurring = watch("isRecurring");

  return (
    <div className="min-h-screen bg-black py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/meetings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Meetings
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Schedule New Meeting</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                Meeting Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">Meeting Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Weekly Team Standup"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  {...register("title")}
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the meeting agenda..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  rows={3}
                  {...register("description")}
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="duration" className="text-gray-300">Duration</Label>
                  <Select onValueChange={(value) => setValue("duration", parseInt(value))} defaultValue="60">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()} className="text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="agentId" className="text-gray-300">AI Agent (Optional)</Label>
                  <Select onValueChange={(value) => setValue("agentId", value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="" className="text-white">No Agent</SelectItem>
                      {agents?.map((agent: any) => (
                        <SelectItem key={agent.id} value={agent.id} className="text-white">
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Meeting Date & Time</Label>
                <div className="flex gap-4 mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                          !selectedDate && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="bg-gray-900"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Input
                    type="time"
                    className="bg-white/10 border-white/20 text-white"
                    onChange={(e) => {
                      if (selectedDate && e.target.value) {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(selectedDate);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setSelectedDate(newDate);
                      }
                    }}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Leave empty to start immediately
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={watchedIsRecurring}
                  onChange={(e) => setValue("isRecurring", e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isRecurring" className="text-gray-300">Make this a recurring meeting</Label>
              </div>

              {watchedIsRecurring && (
                <div>
                  <Label htmlFor="recurringType" className="text-gray-300">Recurrence</Label>
                  <Select onValueChange={(value) => setValue("recurringType", value as any)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {RECURRING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meeting Preview */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Meeting Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Video className="w-4 h-4" />
                  <span className="font-medium">{watch("title") || "Untitled Meeting"}</span>
                </div>
                
                {watch("description") && (
                  <p className="text-gray-400 text-sm">{watch("description")}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{watch("duration") || 60} minutes</span>
                  </div>
                  
                  {watch("agentId") && (
                    <div className="flex items-center gap-1">
                      <Bot className="w-4 h-4" />
                      <span>{agents?.find((a: any) => a.id === watch("agentId"))?.name || "AI Agent"}</span>
                    </div>
                  )}
                  
                  {selectedDate && (
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(selectedDate, "MMM dd, yyyy 'at' HH:mm")}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/meetings">Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Meeting
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}