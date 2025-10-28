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
  TestTube,
  Zap
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
import { cn } from "@/lib/utils";

export default function AgentsPage() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  const { data: agents, isLoading, isError, refetch } = trpc.agents.getMany.useQuery();

  const deleteAgent = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted");
      refetch();
      setDeletingId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  const toggleActive = trpc.agents.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Agent status updated");
      refetch();
    },
    onError: (e: any) => toast.error(e.message || "Failed to update"),
  });

  const testAgent = trpc.agents.testAgent.useMutation({
    onSuccess: (result) => {
      setTestResult(result.response || "No response");
    },
    onError: (error: any) => {
      setTestResult(`❌ ${error.message || "Agent test failed"}`);
    },
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteAgent.mutate({ id });
  };

  const handleToggleActive = (id: string) => toggleActive.mutate({ id });

  const handleTestAgent = (id: string) => {
    setTestingAgentId(id);
    setTestMessage("");
    setTestResult(null);
  };

  const handleTestSubmit = () => {
    if (testingAgentId && testMessage.trim()) {
      setTestResult("⏳ Running test...");
      testAgent.mutate({ agentId: testingAgentId, message: testMessage.trim() });
    }
  };

  if (isLoading)
    return (
      <div className="py-6 px-4 md:px-8">
        <LoadingState title="Loading agents..." description="Fetching your AI agents" />
      </div>
    );

  if (isError)
    return (
      <div className="py-6 px-4 md:px-8">
        <ErrorState
          title="Error loading agents"
          description="Unable to fetch agents. Try refreshing the page."
        />
      </div>
    );

  return (
    <div className="py-6 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Zap className="text-cyan-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
          <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
            AI Agents
          </h1>
        </div>
        <Button
          asChild
          className="bg-cyan-500/80 hover:bg-cyan-400 text-white shadow-[0_0_12px_-3px_rgba(56,189,248,0.5)]"
        >
          <Link href="/dashboard/agents/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-b from-white/5 to-transparent border-cyan-400/10 hover:shadow-[0_0_25px_-10px_rgba(56,189,248,0.3)] transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Agents</p>
              <p className="text-2xl text-white font-semibold">{agents?.length || 0}</p>
            </div>
            <Bot className="text-cyan-400 w-8 h-8" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-white/5 to-transparent border-green-400/10 hover:shadow-[0_0_25px_-10px_rgba(34,197,94,0.3)] transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Agents</p>
              <p className="text-2xl text-white font-semibold">
                {agents?.filter((a: any) => a.isActive).length || 0}
              </p>
            </div>
            <Play className="text-green-400 w-8 h-8 animate-pulse" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-white/5 to-transparent border-gray-400/10 hover:shadow-[0_0_25px_-10px_rgba(156,163,175,0.3)] transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Inactive Agents</p>
              <p className="text-2xl text-white font-semibold">
                {agents?.filter((a: any) => !a.isActive).length || 0}
              </p>
            </div>
            <Pause className="text-gray-400 w-8 h-8" />
          </CardContent>
        </Card>
      </div>

      {/* Agents */}
      {agents?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent: any, index: number) => (
            <Card
              key={agent.id}
              className={`bg-gradient-to-b from-white/5 via-black/30 to-transparent border-cyan-400/10 hover:shadow-[0_0_25px_-10px_rgba(56,189,248,0.3)] transition-all backdrop-blur-sm ${animations.cardHover} ${animations.fadeInUp} ${animations[`stagger${index + 1}` as keyof typeof animations]}`}
            >
              <CardHeader className="pb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      agent.isActive
                        ? "bg-blue-500/20 border border-blue-400/30 active-glow"
                        : "bg-gray-500/20 border border-gray-400/30"
                    )}
                  >
                    <Bot className={agent.isActive ? "text-blue-400" : "text-gray-400"} />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        agent.isActive
                          ? "border-blue-400/30 text-blue-400 bg-blue-500/10"
                          : "border-gray-400/30 text-gray-400 bg-gray-500/10"
                      }
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-black/90 border border-cyan-400/20">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/agents/${agent.id}/edit`} className="text-white">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTestAgent(agent.id)} className="text-white">
                      <TestTube className="w-4 h-4 mr-2" /> Test Agent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(agent.id)} className="text-white">
                      {agent.isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" /> Deactivate
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" /> Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-cyan-400/10" />
                    <DropdownMenuItem
                      onClick={() => handleDelete(agent.id)}
                      className="text-red-400 hover:bg-red-500/10"
                      disabled={deletingId === agent.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingId === agent.id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {agent.description || "No description"}
                </p>

                <div className="space-y-2 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> {agent.voice} voice
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" /> {agent.provider} – {agent.model}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {agent.capabilities?.can_schedule && (
                    <Badge variant="outline" className="border-blue-400/30 text-blue-400 text-xs">
                      <Calendar className="w-3 h-3 mr-1" /> Schedule
                    </Badge>
                  )}
                  {agent.capabilities?.can_take_notes && (
                    <Badge variant="outline" className="border-green-400/30 text-green-400 text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" /> Notes
                    </Badge>
                  )}
                  {agent.capabilities?.can_record && (
                    <Badge variant="outline" className="border-purple-400/30 text-purple-400 text-xs">
                      <Mic className="w-3 h-3 mr-1" /> Record
                    </Badge>
                  )}
                  {agent.capabilities?.can_translate && (
                    <Badge variant="outline" className="border-orange-400/30 text-orange-400 text-xs">
                      <Languages className="w-3 h-3 mr-1" /> Translate
                    </Badge>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                  <span>Created {format(new Date(agent.createdAt), "MMM dd, yyyy")}</span>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10"
                  >
                    <Link href={`/dashboard/agents/${agent.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/5 border-cyan-400/10 text-center p-12">
          <CardContent>
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No agents yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first AI agent to start.
            </p>
            <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-white">
              <Link href="/dashboard/agents/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Agent Modal */}
      {testingAgentId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-cyan-400/20 rounded-xl p-6 w-full max-w-md mx-4 shadow-[0_0_40px_-10px_rgba(56,189,248,0.4)]">
            <h3 className="text-lg font-semibold text-white mb-4">Test Agent</h3>
            <div className="space-y-4">
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter a message..."
                className="w-full px-3 py-2 bg-white/5 border border-cyan-400/20 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/40"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTestingAgentId(null);
                    setTestMessage("");
                    setTestResult(null);
                  }}
                  className="border-cyan-400/20 text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTestSubmit}
                  disabled={!testMessage.trim() || testAgent.isPending}
                  className="bg-cyan-500 hover:bg-cyan-400 text-white"
                >
                  {testAgent.isPending ? "Testing..." : "Run Test"}
                </Button>
              </div>

              {testResult && (
                <div className="mt-4 bg-black/40 border border-cyan-400/10 rounded-lg p-3 text-gray-300 text-sm whitespace-pre-line animate-fade-in">
                  {testResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 6px rgba(34,197,94,0.5);
          }
          50% {
            box-shadow: 0 0 14px rgba(34,197,94,0.8);
          }
        }
        .active-glow {
          animation: glow 2.5s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
