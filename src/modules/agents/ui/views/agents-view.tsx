
"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, BotIcon } from "lucide-react";
import Link from "next/link";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { AgentCard } from "../components/agent-card";
import { useState } from "react";

export const AgentsView = () => {
  const { data: agents, isLoading, isError, error } = trpc.agents.getMany.useQuery();

  if (isLoading) return <LoadingState title="Loading agents..." description="Fetching your AI agents." />;
  if (isError) return <ErrorState title="Error loading agents" description={error?.message || "Something went wrong."} />;

    return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My AI Agents</h1>
          <p className="text-gray-400">Manage your intelligent AI assistants for meetings</p>
        </div>
        <Button asChild className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
          <Link href="/agents/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Agent
          </Link>
        </Button>
      </div>

      {agents && agents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={(agentId) => {
                window.location.href = `/agents/${agentId}/edit`;
              }}
              onDuplicate={async (agentId) => {
                // Handle duplicate - simplified
                console.log('Duplicate agent:', agentId);
                window.location.reload();
              }}
              onDelete={() => {
                window.location.reload();
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BotIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create your first AI agent to enhance your meetings with intelligent assistance.
          </p>
          <Button asChild className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
            <Link href="/agents/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Link>
          </Button>
        </div>
      )}
        </div>
    );
};

export const AgentsViewLoading = () => {
    return(
        <LoadingState 
        title=" Loading Agents" 
        description="This may take a fews seconds.."/>
    );
};

export const AgentsViewError = () => {
    return(
        <ErrorState
                title="Error Loading Agents..."
                description="Something went wrong"
                />
    );
};
