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
});

export const agentUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Имя агента обязательно" }).optional(),
  instructions: z.string().min(1, { message: "Инструкции агента обязательны" }).optional(),
});

// Subscription schemas
export const subscriptionSchema = z.object({
  plan: z.enum(["free", "pro", "enterprise"], {
    errorMap: () => ({ message: "Выберите корректный тарифный план" })
  }),
});

// Type exports
export type MeetingInsert = z.infer<typeof meetingInsertSchema>;
export type MeetingUpdate = z.infer<typeof meetingUpdateSchema>;
export type AgentInsert = z.infer<typeof agentsInsertSchema>;
export type AgentUpdate = z.infer<typeof agentUpdateSchema>;
export type SubscriptionCreate = z.infer<typeof subscriptionSchema>;