"use client";

import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentForm } from "@/modules/agents/ui/components/agent-form";
import { useRouter } from "next/navigation";

interface AgentEditPageProps {
  params: {
    id: string;
  };
}

const AgentEditView = ({ agentId }: { agentId: string }) => {
  const router = useRouter();
  const { data: agent, isLoading, isError, error } = trpc.agents.getOne.useQuery({ id: agentId });

  if (isLoading) return <LoadingState title="Loading agent..." description="Fetching agent details." />;
  if (isError) return <ErrorState title="Error loading agent" description={error?.message || "Something went wrong."} />;
  if (!agent) return <ErrorState title="Agent not found" description="The requested agent could not be found." />;

  const handleSuccess = () => {
    router.push(`/agents/${agentId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Agent</h1>
          <p className="text-gray-400">Update your AI agent settings and instructions</p>
        </div>
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-8">
            <AgentForm
              agentId={agentId}
              initialValues={{
                name: agent.name,
                instructions: agent.instructions,
              }}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AgentEditPage = ({ params }: AgentEditPageProps) => {
  return (
    <Suspense fallback={<LoadingState title="Loading agent..." description="Fetching agent details." />}>
      <AgentEditView agentId={params.id} />
    </Suspense>
  );
};

export default AgentEditPage;
