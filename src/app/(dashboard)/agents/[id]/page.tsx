"use client";

import { Suspense, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BotIcon, Edit, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { AgentDeleteDialog } from "@/modules/agents/ui/components/agent-delete-dialog";
import { AgentEditDialog } from "@/modules/agents/ui/components/agent-edit-dialog";

interface AgentDetailsPageProps {
  params: {
    id: string;
  };
}

const AgentDetailsView = ({ agentId }: { agentId: string }) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: agent, isLoading, isError, error } = trpc.agents.getOne.useQuery({ id: agentId });

  if (isLoading) return <LoadingState title="Loading agent..." description="Fetching agent details." />;
  if (isError) return <ErrorState title="Error loading agent" description={error?.message || "Something went wrong."} />;
  if (!agent) return <ErrorState title="Agent not found" description="The requested agent could not be found." />;

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    router.push("/agents");
  };

  const handleEditSuccess = () => {
    // Refetch agent data or reload page
    window.location.reload();
  };

  return (
    <div className="py-4 px-4 md:px-8 space-y-6">
      {/* Agent Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BotIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
              <Badge variant="secondary" className="mt-1">AI Agent</Badge>
            </div>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Instructions</h3>
            <p className="text-gray-400 whitespace-pre-wrap">{agent.instructions}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="text-white">{format(agent.createdAt, 'PPP')}</p>
              </div>
            </div>

            {agent.updatedAt.getTime() !== agent.createdAt.getTime() && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-white">{format(agent.updatedAt, 'PPP')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-sm text-gray-400">Meetings Used In</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-sm text-gray-400">Hours Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-sm text-gray-400">Interactions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AgentDeleteDialog
        agentId={agentId}
        agentName={agent.name}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
      />

      <AgentEditDialog
        agentId={agentId}
        agentName={agent.name}
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        initialData={{
          name: agent.name,
          instructions: agent.instructions,
        }}
      />
    </div>
  );
};

const AgentDetailsPage = ({ params }: AgentDetailsPageProps) => {
  return (
    <Suspense fallback={<LoadingState title="Loading agent..." description="Fetching agent details." />}>
      <AgentDetailsView agentId={params.id} />
    </Suspense>
  );
};

export default AgentDetailsPage;
