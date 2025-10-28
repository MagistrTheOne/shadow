"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentForm } from "./agent-form";

interface AgentEditDialogProps {
  agentId: string;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData: {
    name: string;
    instructions: string;
    provider: "sber" | "openai";
    model: string;
    description?: string;
    voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
    personality?: {
      tone?: "professional" | "casual" | "friendly" | "formal";
      expertise?: string[];
      communication_style?: string;
    };
    capabilities?: {
      can_schedule?: boolean;
      can_take_notes?: boolean;
      can_record?: boolean;
      can_translate?: boolean;
      languages?: string[];
    };
  };
}

export const AgentEditDialog = ({
  agentId,
  agentName,
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AgentEditDialogProps) => {
  const handleSuccess = () => {
    onClose();
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Update the settings for &quot;{agentName}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AgentForm
            agentId={agentId}
            initialValues={initialData}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
