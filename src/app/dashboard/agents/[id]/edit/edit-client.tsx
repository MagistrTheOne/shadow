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
  provider: z.enum(["sber", "openai"]),
  model: z.string(),
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
  { value: "GigaChat-2", label: "GigaChat-2 (Next generation)" },
  { value: "GigaChat-2-Pro", label: "GigaChat-2 Pro (Advanced next-gen)" },
  { value: "GigaChat-2-Max", label: "GigaChat-2 Max (Maximum capabilities)" },
  { value: "GigaChat-Max", label: "GigaChat Max (Maximum performance)" },
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

interface EditAgentClientProps {
  id: string;
}

export function EditAgentClient({ id }: EditAgentClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: agent, isLoading, isError } = trpc.agents.getOne.useQuery({ id });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      voice: "alloy",
      personality: {
        tone: "professional",
        expertise: [],
        communication_style: "Clear and concise",
      },
      capabilities: {
        can_schedule: false,
        can_take_notes: false,
        can_record: false,
        can_translate: false,
        languages: [],
      },
    },
  });

  // Получаем доступные провайдеры и модели
  const { data: providers = [] } = trpc.agents.getProviders.useQuery();
  const currentProvider = watch("provider");
  const models = currentProvider === "sber" ? SBER_MODELS : OPENAI_MODELS;

  const createAgent = trpc.agents.create.useMutation({
    onSuccess: () => {
      toast.success("Agent created successfully!");
      router.push("/dashboard/agents");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create agent");
      setIsSubmitting(false);
    },
  });

  const updateAgent = trpc.agents.update.useMutation({
    onSuccess: () => {
      toast.success("Agent updated successfully!");
      router.push("/dashboard/agents");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update agent");
      setIsSubmitting(false);
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

  // Заполняем форму данными агента при загрузке
  useEffect(() => {
    if (agent) {
      setValue("name", agent.name);
      setValue("description", agent.description || "");
      setValue("voice", agent.voice as any);
      setValue("instructions", agent.instructions);
      setValue("provider", agent.provider as any);
      setValue("model", agent.model);
      
      if (agent.personality) {
        setValue("personality.tone", agent.personality.tone as any);
        setValue("personality.expertise", agent.personality.expertise || []);
        setValue("personality.communication_style", agent.personality.communication_style || "");
      }
      
      if (agent.capabilities) {
        setValue("capabilities.can_schedule", agent.capabilities.can_schedule || false);
        setValue("capabilities.can_take_notes", agent.capabilities.can_take_notes || false);
        setValue("capabilities.can_record", agent.capabilities.can_record || false);
        setValue("capabilities.can_translate", agent.capabilities.can_translate || false);
        setValue("capabilities.languages", agent.capabilities.languages || []);
      }
    }
  }, [agent, setValue]);

  const onSubmit = async (data: AgentFormData) => {
    setIsSubmitting(true);
    
    try {
      if (id === "new") {
        await createAgent.mutateAsync({
          ...data,
          personality: data.personality,
          capabilities: data.capabilities,
        });
      } else {
        await updateAgent.mutateAsync({
          id,
          ...data,
          personality: data.personality,
          capabilities: data.capabilities,
        });
      }
    } catch (error) {
      console.error("Error saving agent:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      setIsDeleting(true);
      await deleteAgent.mutateAsync({ id });
    }
  };

  const handleExpertiseChange = (expertise: string, checked: boolean) => {
    const currentExpertise = watch("personality.expertise");
    if (checked) {
      setValue("personality.expertise", [...currentExpertise, expertise]);
    } else {
      setValue("personality.expertise", currentExpertise.filter(e => e !== expertise));
    }
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    const currentLanguages = watch("capabilities.languages");
    if (checked) {
      setValue("capabilities.languages", [...currentLanguages, language]);
    } else {
      setValue("capabilities.languages", currentLanguages.filter(l => l !== language));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading agent...</div>
      </div>
    );
  }

  if (isError || !agent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/agents">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agents
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-400" />
            {id === "new" ? "Create New Agent" : "Edit Agent"}
          </h1>
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Agent Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    placeholder="Enter agent name"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
                  <Input
                    id="description"
                    {...register("description")}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    placeholder="Brief description of the agent"
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="provider" className="text-gray-300">AI Provider</Label>
                  <Select onValueChange={(value) => {
                    setValue("provider", value as "sber" | "openai");
                    // Reset model when provider changes
                    const newModels = value === "sber" ? SBER_MODELS : OPENAI_MODELS;
                    setValue("model", newModels[0].value);
                  }} defaultValue="sber">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="sber" className="text-white">Sber GigaChat</SelectItem>
                      <SelectItem value="openai" className="text-white">OpenAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model" className="text-gray-300">AI Model</Label>
                  <Select onValueChange={(value) => setValue("model", value)} value={watch("model")}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {models.map((model) => (
                        <SelectItem key={model.value} value={model.value} className="text-white">
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="voice" className="text-gray-300">Voice</Label>
                <Select onValueChange={(value) => setValue("voice", value as any)} defaultValue="alloy">
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {VOICE_OPTIONS.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value} className="text-white">
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="instructions" className="text-gray-300">Instructions</Label>
                <Textarea
                  id="instructions"
                  {...register("instructions")}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[120px]"
                  placeholder="Detailed instructions for the agent's behavior and responses..."
                />
                {errors.instructions && <p className="text-red-400 text-sm mt-1">{errors.instructions.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Personality */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Personality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-gray-300">Tone</Label>
                <Select onValueChange={(value) => setValue("personality.tone", value as any)} defaultValue="professional">
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {TONE_OPTIONS.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value} className="text-white">
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Expertise Areas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {EXPERTISE_OPTIONS.map((expertise) => (
                    <div key={expertise} className="flex items-center space-x-2">
                      <Checkbox
                        id={expertise}
                        checked={watch("personality.expertise").includes(expertise)}
                        onCheckedChange={(checked) => handleExpertiseChange(expertise, checked as boolean)}
                      />
                      <Label htmlFor={expertise} className="text-sm text-gray-300">{expertise}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="communication_style" className="text-gray-300">Communication Style</Label>
                <Input
                  id="communication_style"
                  {...register("personality.communication_style")}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  placeholder="e.g., Clear and concise, Friendly and approachable"
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_schedule"
                    {...register("capabilities.can_schedule")}
                  />
                  <Label htmlFor="can_schedule" className="text-sm text-gray-300">Schedule Meetings</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_take_notes"
                    {...register("capabilities.can_take_notes")}
                  />
                  <Label htmlFor="can_take_notes" className="text-sm text-gray-300">Take Notes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_record"
                    {...register("capabilities.can_record")}
                  />
                  <Label htmlFor="can_record" className="text-sm text-gray-300">Record Audio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_translate"
                    {...register("capabilities.can_translate")}
                  />
                  <Label htmlFor="can_translate" className="text-sm text-gray-300">Translate</Label>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Languages</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                  {LANGUAGE_OPTIONS.map((language) => (
                    <div key={language.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={language.value}
                        checked={watch("capabilities.languages").includes(language.value)}
                        onCheckedChange={(checked) => handleLanguageChange(language.value, checked as boolean)}
                      />
                      <Label htmlFor={language.value} className="text-sm text-gray-300">{language.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-red-400/30 text-red-400 hover:bg-red-400/10"
              onClick={handleDelete}
              disabled={isDeleting || id === "new"}
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

            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {id === "new" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {id === "new" ? "Create Agent" : "Update Agent"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
