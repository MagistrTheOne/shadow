import {z} from "zod";

// Meeting schemas
export const meetingInsertSchema = z.object({
  title: z.string().min(1, { message: "Название встречи обязательно" }),
  description: z.string().optional(),
  scheduledAt: z.date().optional(),
  agentId: z.string().optional(),
});

export const meetingUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: "Название встречи обязательно" }).optional(),
  description: z.string().optional(),
  scheduledAt: z.date().optional(),
  agentId: z.string().optional(),
  status: z.enum(["scheduled", "active", "completed", "cancelled"]).optional(),
});

// Agent schemas
export const agentsInsertSchema = z.object({
  name: z.string().min(1, { message: "Имя агента обязательно" }),
  instructions: z.string().min(1, { message: "Инструкции агента обязательны" }),
  provider: z.enum(["sber", "openai"]),
  model: z.string().min(1, { message: "Модель обязательна" }),
  description: z.string().optional(),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional(),
  personality: z.object({
    tone: z.enum(["professional", "casual", "friendly", "formal"]).optional(),
    expertise: z.array(z.string()).optional(),
    communication_style: z.string().optional(),
  }).optional(),
  capabilities: z.object({
    can_schedule: z.boolean().optional(),
    can_take_notes: z.boolean().optional(),
    can_record: z.boolean().optional(),
    can_translate: z.boolean().optional(),
    languages: z.array(z.string()).optional(),
  }).optional(),
});

export const agentUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Имя агента обязательно" }).optional(),
  instructions: z.string().min(1, { message: "Инструкции агента обязательны" }).optional(),
  provider: z.enum(["sber", "openai"]).optional(),
  model: z.string().min(1, { message: "Модель обязательна" }).optional(),
  description: z.string().optional(),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional(),
  personality: z.object({
    tone: z.enum(["professional", "casual", "friendly", "formal"]).optional(),
    expertise: z.array(z.string()).optional(),
    communication_style: z.string().optional(),
  }).optional(),
  capabilities: z.object({
    can_schedule: z.boolean().optional(),
    can_take_notes: z.boolean().optional(),
    can_record: z.boolean().optional(),
    can_translate: z.boolean().optional(),
    languages: z.array(z.string()).optional(),
  }).optional(),
});

// Subscription schemas
export const subscriptionSchema = z.object({
  plan: z.enum(["free", "pro", "enterprise"]),
});

// Type exports
export type MeetingInsert = z.infer<typeof meetingInsertSchema>;
export type MeetingUpdate = z.infer<typeof meetingUpdateSchema>;
export type AgentInsert = z.infer<typeof agentsInsertSchema>;
export type AgentUpdate = z.infer<typeof agentUpdateSchema>;
export type SubscriptionCreate = z.infer<typeof subscriptionSchema>;