"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  User,
  Sparkles,
  Zap,
  Brain,
  Code,
  TestTube,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { animations } from "@/lib/animations";
import { formAnimations } from "@/lib/form-animations";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GeneratedAvatar } from "@/components/generate-avatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AgentClientProps {
  id: string;
}

const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy - Balanced and versatile" },
  { value: "echo", label: "Echo - Clear and articulate" },
  { value: "fable", label: "Fable - Warm and expressive" },
  { value: "onyx", label: "Onyx - Deep and authoritative" },
  { value: "nova", label: "Nova - Bright and energetic" },
  { value: "shimmer", label: "Shimmer - Soft and gentle" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-green-500" },
  { value: "inactive", label: "Inactive", color: "bg-gray-500" },
  { value: "testing", label: "Testing", color: "bg-yellow-500" },
  { value: "error", label: "Error", color: "bg-red-500" },
];

export function AgentClient({ id }: AgentClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");

  const { data: agent, isLoading, isError, refetch } = trpc.agents.getOne.useQuery({ id });

  const testAgent = trpc.agents.testAgent.useMutation({
    onSuccess: (data) => {
      setTestResponse(data.response);
      setIsTestLoading(false);
      toast.success("Agent test completed!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to test agent");
      setIsTestLoading(false);
    },
  });

  const deleteAgent = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted successfully!");
      router.push("/dashboard/agents");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete agent");
      setIsDeleting(false);
    },
  });

  const testAgent = trpc.agents.test.useMutation({
    onSuccess: (response: any) => {
      setTestResponse(response.message || "Test completed successfully");
      setIsTesting(false);
      toast.success("Agent test completed!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to test agent");
      setIsTesting(false);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      setIsDeleting(true);
      deleteAgent.mutate({ id });
    }
  };

  const handleTestAgent = () => {
    if (!testMessage.trim()) {
      toast.error("Please enter a test message");
      return;
    }
    
    setIsTestLoading(true);
    setTestResponse("");
    testAgent.mutate({ 
      agentId: id, 
      message: testMessage 
    });
  };


  if (isLoading) {
    return <LoadingState title="Loading agent..." description="Fetching agent details" />;
  }

  if (isError || !agent) {
    return <ErrorState title="Agent not found" description="The agent you are looking for does not exist or is inaccessible." />;
  }

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.label || "Unknown";
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-400" />
            {agent.name}
          </h1>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(agent.status || 'inactive')} text-white border-current`}
          >
            {getStatusLabel(agent.status || 'inactive')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Info */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {agent.avatar ? (
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>
                          <Bot className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <GeneratedAvatar 
                        seed={agent.name} 
                        variant="initials" 
                        className="w-16 h-16"
                      />
                    )}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black ${getStatusColor(agent.status || 'inactive')}`} />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">{agent.name}</CardTitle>
                    {agent.description && (
                      <p className="text-gray-400 mt-1">{agent.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-400">Provider</Label>
                    <p className="text-white capitalize">{agent.provider}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Model</Label>
                    <p className="text-white">{agent.model}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Voice</Label>
                    <p className="text-white capitalize">{agent.voice}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Created</Label>
                    <p className="text-white">{format(new Date(agent.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">{agent.instructions}</p>
              </CardContent>
            </Card>

            {/* Personality & Capabilities */}
            {(agent.personality || agent.capabilities) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agent.personality && (
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Personality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {agent.personality.tone && (
                          <div>
                            <Label className="text-gray-400">Tone</Label>
                            <p className="text-white capitalize">{agent.personality.tone}</p>
                          </div>
                        )}
                        {agent.personality.expertise && agent.personality.expertise.length > 0 && (
                          <div>
                            <Label className="text-gray-400">Expertise</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {agent.personality.expertise.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {agent.personality.communication_style && (
                          <div>
                            <Label className="text-gray-400">Communication Style</Label>
                            <p className="text-white">{agent.personality.communication_style}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {agent.capabilities && (
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Capabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {agent.capabilities.can_schedule && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-white">Schedule</span>
                            </div>
                          )}
                          {agent.capabilities.can_take_notes && (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-white">Take Notes</span>
                            </div>
                          )}
                          {agent.capabilities.can_record && (
                            <div className="flex items-center gap-2">
                              <Mic className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-white">Record</span>
                            </div>
                          )}
                          {agent.capabilities.can_translate && (
                            <div className="flex items-center gap-2">
                              <Languages className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm text-white">Translate</span>
                            </div>
                          )}
                        </div>
                        {agent.capabilities.languages && agent.capabilities.languages.length > 0 && (
                          <div>
                            <Label className="text-gray-400">Languages</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {agent.capabilities.languages.map((lang: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Test Agent */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-cyan-400" />
                  Test Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-message" className="text-gray-300">Test Message</Label>
                    <ShadcnTextarea
                      id="test-message"
                      placeholder="Enter a message to test the agent..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleTestAgent} 
                      disabled={isTestLoading || !testMessage.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isTestLoading ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Test Agent
                        </>
                      )}
                    </Button>
                    <Button
                      asChild
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Link href={`/dashboard/chats?agentId=${id}`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Chat
                      </Link>
                    </Button>
                  </div>
                  {testResponse && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <Label className="text-gray-400">Response</Label>
                      <p className="text-white mt-2">{testResponse}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  asChild 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href={`/dashboard/agents/${agent.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Agent
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Agent
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">{format(new Date(agent.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white">{format(new Date(agent.updatedAt), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(agent.status || 'inactive')} text-white border-current`}
                    >
                      {getStatusLabel(agent.status || 'inactive')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
