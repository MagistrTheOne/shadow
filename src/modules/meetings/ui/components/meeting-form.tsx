"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2, BotIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { meetingInsertSchema } from "@/modules/schemas";

interface MeetingFormProps {
  onSuccess?: () => void;
  initialValues?: z.infer<typeof meetingInsertSchema>;
}

export const MeetingForm = ({ onSuccess, initialValues }: MeetingFormProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Получаем список агентов
  const { data: agents } = trpc.agents.getMany.useQuery();

  const createMeetingMutation = trpc.meetings.create.useMutation({
    onSuccess: () => {
      toast.success("Meeting created successfully!");
      router.push("/meetings");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create meeting", {
        description: error.message,
      });
    },
  });

  const form = useForm<z.infer<typeof meetingInsertSchema>>({
    resolver: zodResolver(meetingInsertSchema),
    defaultValues: initialValues || {
      title: "",
      description: "",
      scheduledAt: new Date(),
      agentId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof meetingInsertSchema>) => {
    setIsPending(true);
    try {
      await createMeetingMutation.mutateAsync(values);
      toast.success("Meeting created successfully!");
      onSuccess?.();
      router.push("/meetings");
    } catch (error: any) {
      toast.error("Failed to create meeting", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Meeting Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Meeting Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scheduled Date & Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP HH:mm")
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <BotIcon className="w-4 h-4" />
                AI Agent (Optional)
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI agent for this meeting" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">No agent</SelectItem>
                  {agents?.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Meeting
        </Button>
      </form>
    </Form>
  );
};