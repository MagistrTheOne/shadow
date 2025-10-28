"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  ArrowLeft,
  Settings,
  MessageSquare,
  Calendar,
  Mic,
  Languages,
  Clock,
  User
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

interface AgentDetailPageProps {
  params: { id: string };
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: agent, isLoading, isError } = trpc.agents.getOne.useQuery({ id: params.id });

  const deleteAgent = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted successfully!");
      router.push("/dashboard/agents");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete agent");
      setIsDeleting(false);
    },
  });

  const toggleActive = trpc.agents.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Agent status updated");
      // Refetch the agent data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update agent");
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      setIsDeleting(true);
      deleteAgent.mutate({ id: params.id });
    }
  };

  const handleToggleActive = () => {
    toggleActive.mutate({ id: params.id });
  };

  if (isLoading) {
    return (
      <div className="py-6 px-4 md:px-8">
        <LoadingState
          title="Loading agent..."
          description="Fetching agent details"
        />
      </div>
    );
  }

  if (isError || !agent) {
    return (
      <div className="py-6 px-4 md:px-8">
        <ErrorState
          title="Agent not found"
          description="The agent you're looking for doesn't exist or you don't have permission to access it."
        />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/agents">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Agents
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={agent.isActive ? "default" : "secondary"}
                    className={agent.isActive ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-gray-500/20 text-gray-400 border-gray-400/30"}
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    Created {format(new Date(agent.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleActive}
              className={agent.isActive ? "border-orange-400/30 text-orange-400 hover:bg-orange-400/10" : "border-green-400/30 text-green-400 hover:bg-green-400/10"}
            >
              {agent.isActive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href={`/dashboard/agents/${agent.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {agent.description && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{agent.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{agent.instructions}</p>
                </div>
              </CardContent>
            </Card>

            {/* Personality */}
            {agent.personality && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Personality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-gray-400 text-sm">Tone</Label>
                      <p className="text-white capitalize">{agent.personality.tone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Communication Style</Label>
                      <p className="text-white">{agent.personality.communication_style}</p>
                    </div>
                  </div>
                  
                  {agent.personality.expertise && agent.personality.expertise.length > 0 && (
                    <div>
                      <Label className="text-gray-400 text-sm">Expertise Areas</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {agent.personality.expertise.map((expertise) => (
                          <Badge key={expertise} variant="outline" className="border-blue-400/30 text-blue-400">
                            {expertise}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Settings */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Voice Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mic className="w-4 h-4" />
                    <span className="capitalize">{agent.voice} voice</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            {agent.capabilities && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agent.capabilities.can_schedule && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>Can Schedule Meetings</span>
                    </div>
                  )}
                  {agent.capabilities.can_take_notes && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      <span>Can Take Notes</span>
                    </div>
                  )}
                  {agent.capabilities.can_record && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span>Can Record Meetings</span>
                    </div>
                  )}
                  {agent.capabilities.can_translate && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Languages className="w-4 h-4 text-orange-400" />
                      <span>Can Translate</span>
                    </div>
                  )}
                  
                  {agent.capabilities.languages && agent.capabilities.languages.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-gray-400 text-sm">Supported Languages</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agent.capabilities.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs border-gray-400/30 text-gray-400">
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Agent Info */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span>Created by you</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Created {format(new Date(agent.createdAt), "MMM dd, yyyy 'at' HH:mm")}</span>
                </div>
                {agent.updatedAt && agent.updatedAt !== agent.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Updated {format(new Date(agent.updatedAt), "MMM dd, yyyy 'at' HH:mm")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={`/dashboard/meetings/new?agent=${agent.id}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-white/20 text-gray-300 hover:bg-white/10">
                  <Link href={`/dashboard/agents/${agent.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Agent
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}