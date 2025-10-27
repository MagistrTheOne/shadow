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

interface MeetingDeleteDialogProps {
  meetingId: string;
  meetingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MeetingDeleteDialog = ({
  meetingId,
  meetingTitle,
  isOpen,
  onClose,
  onSuccess,
}: MeetingDeleteDialogProps) => {
  const deleteMeetingMutation = trpc.meetings.delete.useMutation({
    onSuccess: () => {
      toast.success("Meeting deleted successfully!");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to delete meeting", {
        description: error.message,
      });
    },
  });

  const handleDelete = async () => {
    try {
      await deleteMeetingMutation.mutateAsync({ id: meetingId });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isPending = deleteMeetingMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{meetingTitle}&quot;? This action cannot be undone
            and will permanently remove the meeting and all associated data.
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
            Delete Meeting
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
