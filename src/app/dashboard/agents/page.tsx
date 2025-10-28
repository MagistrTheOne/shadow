"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  Settings,
  MessageSquare,
  Calendar,
  Mic,
  Languages,
  TestTube
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { animations } from "@/lib/animations";

export default function AgentsPage() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState("");

  const { data: agents, isLoading, isError, refetch } = trpc.agents.getMany.useQuery();

  const deleteAgent = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted successfully");
      refetch();
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete agent");
      setDeletingId(null);
    },
  });

  const toggleActive = trpc.agents.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Agent status updated");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update agent");
    },
  });

  const testAgent = trpc.agents.testAgent.useMutation({
    onSuccess: (result) => {
      toast.success("Agent test successful!", {
        description: result.response,
      });
      setTestingAgentId(null);
      setTestMessage("");
    },
    onError: (error: any) => {
      toast.error("Agent test failed", {
        description: error.message || "An unexpected error occurred.",
      });
      setTestingAgentId(null);
    },
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteAgent.mutate({ id });
  };

  const handleToggleActive = (id: string) => {
    toggleActive.mutate({ id });
  };

  const handleTestAgent = (id: string) => {
    setTestingAgentId(id);
    setTestMessage("");
  };

  const handleTestSubmit = () => {
    if (testingAgentId && testMessage.trim()) {
      testAgent.mutate({
        agentId: testingAgentId,
        message: testMessage.trim(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 px-4 md:px-8">
        <LoadingState
          title="Loading agents..."
          description="Fetching your AI agents"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6 px-4 md:px-8">
        <ErrorState
          title="Error loading agents"
          description="Unable to fetch your agents. Please try refreshing the page."
        />
      </div>
    );
  }

  return (
    <div className={`py-6 px-4 md:px-8 ${animations.pageEnter}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-8 ${animations.fadeInUp}`}>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Agents</h1>
          <p className="text-gray-400">Manage your intelligent meeting assistants</p>
        </div>
        <Button asChild className={`bg-blue-600 hover:bg-blue-700 text-white ${animations.buttonHover}`}>
          <Link href="/dashboard/agents/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className={`grid gap-6 md:grid-cols-3 mb-8 ${animations.fadeInUp} ${animations.stagger2}`}>
        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.cardHover}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Agents</p>
                <p className="text-2xl font-bold text-white">{agents?.length || 0}</p>
              </div>
              <Bot className={`h-8 w-8 text-blue-400 ${animations.iconBounce}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.cardHover}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-white">
                  {agents?.filter((agent: any) => agent.isActive).length || 0}
                </p>
              </div>
              <Play className={`h-8 w-8 text-green-400 ${animations.iconPulse}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.cardHover}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Inactive Agents</p>
                <p className="text-2xl font-bold text-white">
                  {agents?.filter((agent: any) => !agent.isActive).length || 0}
                </p>
              </div>
              <Pause className={`h-8 w-8 text-gray-400 ${animations.iconSpin}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      {agents && agents.length > 0 ? (
        <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${animations.fadeInUp} ${animations.stagger3}`}>
          {agents.map((agent: any, index: number) => (
            <Card key={agent.id} className={`bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200 ${animations.cardHover} ${animations.listItem} ${animations[`stagger${index + 1}` as keyof typeof animations]}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                      <Badge 
                        variant={agent.isActive ? "default" : "secondary"}
                        className={agent.isActive ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-gray-500/20 text-gray-400 border-gray-400/30"}
                      >
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/agents/${agent.id}/edit`} className="text-white">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTestAgent(agent.id)}
                              className="text-white"
                            >
                              <TestTube className="w-4 h-4 mr-2" />
                              Test Agent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(agent.id)}
                              className="text-white"
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
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(agent.id)}
                              className="text-red-400"
                              disabled={deletingId === agent.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingId === agent.id ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {agent.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{agent.description}</p>
                )}
                
                {/* Capabilities */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Settings className="w-4 h-4" />
                    <span className="capitalize">{agent.voice} voice</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Bot className="w-4 h-4" />
                    <span className="capitalize">{agent.provider} - {agent.model}</span>
                  </div>
                  
                  {agent.capabilities && (
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.can_schedule && (
                        <Badge variant="outline" className="text-xs border-blue-400/30 text-blue-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          Schedule
                        </Badge>
                      )}
                      {agent.capabilities.can_take_notes && (
                        <Badge variant="outline" className="text-xs border-green-400/30 text-green-400">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Notes
                        </Badge>
                      )}
                      {agent.capabilities.can_record && (
                        <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-400">
                          <Mic className="w-3 h-3 mr-1" />
                          Record
                        </Badge>
                      )}
                      {agent.capabilities.can_translate && (
                        <Badge variant="outline" className="text-xs border-orange-400/30 text-orange-400">
                          <Languages className="w-3 h-3 mr-1" />
                          Translate
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created {format(new Date(agent.createdAt), "MMM dd, yyyy")}</span>
                    <Button asChild size="sm" variant="outline" className={`border-white/20 text-gray-300 hover:bg-white/10 ${animations.buttonHover}`}>
                      <Link href={`/dashboard/agents/${agent.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${animations.fadeIn}`}>
          <CardContent className="p-12 text-center">
            <Bot className={`w-16 h-16 text-gray-400 mx-auto mb-4 ${animations.iconBounce}`} />
            <h3 className="text-xl font-semibold text-white mb-2">No agents yet</h3>
            <p className="text-gray-400 mb-6">Create your first AI agent to get started with intelligent meeting assistance.</p>
            <Button asChild className={`bg-blue-600 hover:bg-blue-700 text-white ${animations.buttonHover}`}>
              <Link href="/dashboard/agents/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Agent
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Agent Modal */}
      {testingAgentId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Test Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test Message
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a test message for the agent..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTestingAgentId(null);
                    setTestMessage("");
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTestSubmit}
                  disabled={!testMessage.trim() || testAgent.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {testAgent.isPending ? "Testing..." : "Test Agent"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}