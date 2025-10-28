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
import { Loader2, BotIcon } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { agentsInsertSchema } from "@/modules/schemas";

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: z.infer<typeof agentsInsertSchema>;
  agentId?: string; // Для редактирования
}

export const AgentForm = ({ onSuccess, onCancel, initialValues, agentId }: AgentFormProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const createAgentMutation = trpc.agents.create.useMutation({
    onSuccess: () => {
      toast.success("Agent created successfully!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create agent", {
        description: error.message,
      });
    },
  });

  const updateAgentMutation = trpc.agents.update.useMutation({
    onSuccess: () => {
      toast.success("Agent updated successfully!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to update agent", {
        description: error.message,
      });
    },
  });

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: initialValues || {
      name: "",
      instructions: "",
      provider: "sber",
      model: "GigaChat:latest",
    },
  });

  const onSubmit = async (values: z.infer<typeof agentsInsertSchema>) => {
    setIsPending(true);
    try {
      if (agentId) {
        // Обновление
        await updateAgentMutation.mutateAsync({
          id: agentId,
          ...values,
        });
      } else {
        // Создание
        await createAgentMutation.mutateAsync(values);
      }
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsPending(false);
    }
  };

  const isLoading = createAgentMutation.isPending || updateAgentMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <BotIcon className="w-4 h-4" />
                Agent Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter agent name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe how this AI agent should behave and respond in meetings..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {agentId ? "Update Agent" : "Create Agent"}
          </Button>
        </div>
      </form>
    </Form>
  );
};