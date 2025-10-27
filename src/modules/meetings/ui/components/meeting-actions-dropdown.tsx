"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Copy, Trash2, Video } from "lucide-react";
import { MeetingDeleteDialog } from "./meeting-delete-dialog";
import Link from "next/link";

interface MeetingActionsDropdownProps {
  meeting: {
    id: string;
    title: string;
    status: string;
  };
  onEdit?: (meetingId: string) => void;
  onDuplicate?: (meetingId: string) => void;
  onDelete?: () => void;
}

export const MeetingActionsDropdown = ({
  meeting,
  onEdit,
  onDuplicate,
  onDelete,
}: MeetingActionsDropdownProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    onEdit?.(meeting.id);
  };

  const handleDuplicate = () => {
    onDuplicate?.(meeting.id);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    onDelete?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {meeting.status === "scheduled" && (
            <DropdownMenuItem asChild>
              <Link href={`/meetings/${meeting.id}/call`}>
                <Video className="mr-2 h-4 w-4" />
                Start Call
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MeetingDeleteDialog
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};
