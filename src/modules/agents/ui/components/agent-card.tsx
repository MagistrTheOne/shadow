"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BotIcon, MoreHorizontal, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { MeetingActionsDropdown } from "./meeting-actions-dropdown"; // Можно переиспользовать или создать аналогичный

interface Agent {
  id: string;
  name: string;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agentId: string) => void;
  onDuplicate?: (agentId: string) => void;
  onDelete?: () => void;
}

export const AgentCard = ({ agent, onEdit, onDuplicate, onDelete }: AgentCardProps) => {
  const handleEdit = () => {
    onEdit?.(agent.id);
  };

  const handleDuplicate = () => {
    onDuplicate?.(agent.id);
  };

  const handleDelete = () => {
    onDelete?.();
  };

  // Сокращаем инструкции для превью
  const shortInstructions = agent.instructions.length > 150
    ? agent.instructions.substring(0, 150) + "..."
    : agent.instructions;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BotIcon className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-white">{agent.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              AI Agent
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-gray-400">{shortInstructions}</p>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <CalendarIcon className="w-4 h-4" />
          <span>Created: {format(agent.createdAt, 'MMM dd, yyyy')}</span>
        </div>

        {agent.updatedAt.getTime() !== agent.createdAt.getTime() && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CalendarIcon className="w-4 h-4" />
            <span>Updated: {format(agent.updatedAt, 'MMM dd, yyyy')}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-gray-300 hover:bg-white/10"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-gray-300 hover:bg-white/10"
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
