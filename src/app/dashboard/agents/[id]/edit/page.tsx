"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bot, Save, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

const agentSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]),
  instructions: z.string().min(10, "Instructions must be at least 10 characters").max(2000, "Instructions must be less than 2000 characters"),
  personality: z.object({
    tone: z.enum(["professional", "casual", "friendly", "formal"]),
    expertise: z.array(z.string()),
    communication_style: z.string().min(1, "Communication style is required"),
  }),
  capabilities: z.object({
    can_schedule: z.boolean(),
    can_take_notes: z.boolean(),
    can_record: z.boolean(),
    can_translate: z.boolean(),
    languages: z.array(z.string()),
  }),
});

type AgentFormData = z.infer<typeof agentSchema>;

const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy - Balanced and versatile" },
  { value: "echo", label: "Echo - Clear and articulate" },
  { value: "fable", label: "Fable - Warm and expressive" },
  { value: "onyx", label: "Onyx - Deep and authoritative" },
  { value: "nova", label: "Nova - Bright and energetic" },
  { value: "shimmer", label: "Shimmer - Soft and gentle" },
];

const SBER_MODELS = [
  { value: "GigaChat", label: "GigaChat (Latest - Production)" },
  { value: "GigaChat-Pro", label: "GigaChat Pro (Advanced capabilities)" },
  { value: "GigaChat-Plus", label: "GigaChat Plus (Enhanced performance)" },
];

const OPENAI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o (Latest)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Cost-effective)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
];

const EXPERTISE_OPTIONS = [
  "Business", "Technology", "Healthcare", "Education", "Finance", 
  "Marketing", "Sales", "Customer Service", "Project Management", 
  "Research", "Writing", "Design", "Legal", "Consulting"
];

interface EditAgentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAgentPage({ params }: EditAgentPageProps) {
  const { id } = await params;
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
  });

  const { data: agent, isLoading, isError } = trpc.agents.getOne.useQuery({ id: id });

  const updateAgent = trpc.agents.update.useMutation({
    onSuccess: () => {
      toast.success("Agent updated successfully!");
      router.push("/dashboard/agents");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update agent");
      setIsUpdating(false);
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

  useEffect(() => {
    if (agent) {
      reset({
        name: agent.name,
        description: agent.description || "",
        voice: agent.voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
        instructions: agent.instructions,
        personality: agent.personality || {
          tone: "professional",
          expertise: [],
          communication_style: "Clear and concise",
        },
        capabilities: agent.capabilities || {
          can_schedule: false,
          can_take_notes: true,
          can_record: true,
          can_translate: false,
          languages: ["en"],
        },
      });
    }
  }, [agent, reset]);

  const onSubmit = async (data: AgentFormData) => {
    setIsUpdating(true);
    updateAgent.mutate({ id: id, ...data });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      setIsDeleting(true);
      deleteAgent.mutate({ id: id });
    }
  };

  const watchedPersonality = watch("personality");
  const watchedCapabilities = watch("capabilities");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-1/4 mb-8"></div>
            <div className="space-y-8">
              <div className="h-64 bg-white/5 rounded"></div>
              <div className="h-64 bg-white/5 rounded"></div>
              <div className="h-64 bg-white/5 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !agent) {
    return (
      <div className="min-h-screen bg-black py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Agent not found</h1>
          <p className="text-gray-400 mb-6">The agent you're looking for doesn't exist or you don't have permission to access it.</p>
          <Button asChild>
            <Link href="/dashboard/agents">Back to Agents</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 md:px-8">
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
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Edit Agent</h1>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Agent"}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sarah - Sales Assistant"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  {...register("name")}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this agent does..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  rows={3}
                  {...register("description")}
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <Label htmlFor="voice" className="text-gray-300">Voice</Label>
                <Select onValueChange={(value) => setValue("voice", value as any)} value={watch("voice")}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {VOICE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="instructions" className="text-gray-300">
                  Agent Instructions *
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Provide detailed instructions on how this agent should behave, what it should do, and how it should interact with users..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  rows={6}
                  {...register("instructions")}
                />
                {errors.instructions && <p className="text-red-400 text-sm mt-1">{errors.instructions.message}</p>}
                <p className="text-gray-400 text-sm mt-2">
                  Be specific about the agent's role, responsibilities, and communication style.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personality */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Personality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tone" className="text-gray-300">Tone</Label>
                <Select 
                  onValueChange={(value) => setValue("personality.tone", value as any)} 
                  value={watchedPersonality?.tone}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {TONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Expertise Areas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {EXPERTISE_OPTIONS.map((expertise) => (
                    <div key={expertise} className="flex items-center space-x-2">
                      <Checkbox
                        id={expertise}
                        checked={watchedPersonality?.expertise?.includes(expertise) || false}
                        onCheckedChange={(checked) => {
                          const current = watchedPersonality?.expertise || [];
                          const updated = checked
                            ? [...current, expertise]
                            : current.filter(e => e !== expertise);
                          setValue("personality.expertise", updated);
                        }}
                      />
                      <Label htmlFor={expertise} className="text-gray-300 text-sm">{expertise}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="communication_style" className="text-gray-300">Communication Style</Label>
                <Input
                  id="communication_style"
                  placeholder="e.g., Clear and concise, Detailed explanations, etc."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  {...register("personality.communication_style")}
                />
                {errors.personality?.communication_style && (
                  <p className="text-red-400 text-sm mt-1">{errors.personality.communication_style.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_schedule"
                    checked={watchedCapabilities?.can_schedule || false}
                    onCheckedChange={(checked) => setValue("capabilities.can_schedule", !!checked)}
                  />
                  <Label htmlFor="can_schedule" className="text-gray-300">Can Schedule Meetings</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_take_notes"
                    checked={watchedCapabilities?.can_take_notes || false}
                    onCheckedChange={(checked) => setValue("capabilities.can_take_notes", !!checked)}
                  />
                  <Label htmlFor="can_take_notes" className="text-gray-300">Can Take Notes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_record"
                    checked={watchedCapabilities?.can_record || false}
                    onCheckedChange={(checked) => setValue("capabilities.can_record", !!checked)}
                  />
                  <Label htmlFor="can_record" className="text-gray-300">Can Record Meetings</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_translate"
                    checked={watchedCapabilities?.can_translate || false}
                    onCheckedChange={(checked) => setValue("capabilities.can_translate", !!checked)}
                  />
                  <Label htmlFor="can_translate" className="text-gray-300">Can Translate</Label>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Supported Languages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {LANGUAGE_OPTIONS.map((language) => (
                    <div key={language.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={language.value}
                        checked={watchedCapabilities?.languages?.includes(language.value) || false}
                        onCheckedChange={(checked) => {
                          const current = watchedCapabilities?.languages || [];
                          const updated = checked
                            ? [...current, language.value]
                            : current.filter(l => l !== language.value);
                          setValue("capabilities.languages", updated);
                        }}
                      />
                      <Label htmlFor={language.value} className="text-gray-300 text-sm">{language.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/agents">Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}