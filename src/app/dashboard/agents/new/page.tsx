import { AgentForm } from "@/modules/agents/ui/components/agent-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewAgentPage = () => {
  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Agent</h1>
          <p className="text-gray-400">Build an intelligent AI assistant for your meetings</p>
        </div>
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-8">
            <AgentForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewAgentPage;
