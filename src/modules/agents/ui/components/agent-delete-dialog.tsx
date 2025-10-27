"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AgentDeleteDialogProps {
  agentId: string;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AgentDeleteDialog = ({
  agentId,
  agentName,
  isOpen,
  onClose,
  onSuccess,
}: AgentDeleteDialogProps) => {
  const deleteAgentMutation = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted successfully!");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to delete agent", {
        description: error.message,
      });
    },
  });

  const handleDelete = async () => {
    try {
      await deleteAgentMutation.mutateAsync({ id: agentId });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isPending = deleteAgentMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{agentName}&quot;? This action cannot be undone
            and will permanently remove the agent and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Agent
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
