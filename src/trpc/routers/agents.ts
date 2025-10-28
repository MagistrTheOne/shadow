import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../init";
import { agent } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";

export const agentsRouter = createTRPCRouter({
  // Получить всех агентов пользователя
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const agents = await db
      .select()
      .from(agent)
      .where(eq(agent.userId, ctx.auth.user.id))
      .orderBy(desc(agent.createdAt));

    return agents;
  }),

  // Получить одного агента
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const agentData = await db
        .select()
        .from(agent)
        .where(and(eq(agent.id, input.id), eq(agent.userId, ctx.auth.user.id)))
        .limit(1);

      if (!agentData.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return agentData[0];
    }),

  // Создать нового агента
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        avatar: z.string().optional(),
        voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).default("alloy"),
        instructions: z.string().min(10, "Instructions must be at least 10 characters"),
        personality: z.object({
          tone: z.enum(["professional", "casual", "friendly", "formal"]).default("professional"),
          expertise: z.array(z.string()).default([]),
          communication_style: z.string().default("Clear and concise"),
        }).optional(),
        capabilities: z.object({
          can_schedule: z.boolean().default(false),
          can_take_notes: z.boolean().default(true),
          can_record: z.boolean().default(true),
          can_translate: z.boolean().default(false),
          languages: z.array(z.string()).default(["en"]),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newAgent = await db
        .insert(agent)
        .values({
          ...input,
          userId: ctx.auth.user.id,
          personality: input.personality || {
            tone: "professional",
            expertise: [],
            communication_style: "Clear and concise",
          },
          capabilities: input.capabilities || {
            can_schedule: false,
            can_take_notes: true,
            can_record: true,
            can_translate: false,
            languages: ["en"],
          },
        })
        .returning();

      return newAgent[0];
    }),

  // Обновить агента
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        avatar: z.string().optional(),
        voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional(),
        instructions: z.string().min(10).optional(),
        personality: z.object({
          tone: z.enum(["professional", "casual", "friendly", "formal"]),
          expertise: z.array(z.string()),
          communication_style: z.string(),
        }).optional(),
        capabilities: z.object({
          can_schedule: z.boolean(),
          can_take_notes: z.boolean(),
          can_record: z.boolean(),
          can_translate: z.boolean(),
          languages: z.array(z.string()),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const updatedAgent = await db
        .update(agent)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(agent.id, id), eq(agent.userId, ctx.auth.user.id)))
        .returning();

      if (!updatedAgent.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return updatedAgent[0];
    }),

  // Удалить агента
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedAgent = await db
        .delete(agent)
        .where(and(eq(agent.id, input.id), eq(agent.userId, ctx.auth.user.id)))
        .returning();

      if (!deletedAgent.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return { success: true };
    }),

  // Активировать/деактивировать агента
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agentData = await db
        .select({ isActive: agent.isActive })
        .from(agent)
        .where(and(eq(agent.id, input.id), eq(agent.userId, ctx.auth.user.id)))
        .limit(1);

      if (!agentData.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      const updatedAgent = await db
        .update(agent)
        .set({
          isActive: !agentData[0].isActive,
          updatedAt: new Date(),
        })
        .where(and(eq(agent.id, input.id), eq(agent.userId, ctx.auth.user.id)))
        .returning();

      return updatedAgent[0];
    }),
});
