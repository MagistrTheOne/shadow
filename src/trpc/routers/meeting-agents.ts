import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../init";
import { meetingAgents, meetings, agent } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";

export const meetingAgentsRouter = createTRPCRouter({
  // Получить всех агентов встречи
  getByMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const meetingAgentsList = await db
        .select({
          id: meetingAgents.id,
          meetingId: meetingAgents.meetingId,
          agentId: meetingAgents.agentId,
          isActive: meetingAgents.isActive,
          role: meetingAgents.role,
          joinedAt: meetingAgents.joinedAt,
          leftAt: meetingAgents.leftAt,
          agent: {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            avatar: agent.avatar,
            voice: agent.voice,
            provider: agent.provider,
            model: agent.model,
            personality: agent.personality,
            capabilities: agent.capabilities,
          },
        })
        .from(meetingAgents)
        .innerJoin(agent, eq(meetingAgents.agentId, agent.id))
        .where(
          and(
            eq(meetingAgents.meetingId, input.meetingId),
            eq(agent.userId, ctx.auth.user.id)
          )
        )
        .orderBy(desc(meetingAgents.joinedAt));

      return meetingAgentsList;
    }),

  // Добавить агента к встрече
  addToMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        agentId: z.string(),
        role: z.enum(["moderator", "participant", "observer"]).default("participant"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что встреча принадлежит пользователю
      const meeting = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, input.meetingId), eq(meetings.userId, ctx.auth.user.id)))
        .limit(1);

      if (!meeting.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      // Проверяем, что агент принадлежит пользователю
      const agentData = await db
        .select()
        .from(agent)
        .where(and(eq(agent.id, input.agentId), eq(agent.userId, ctx.auth.user.id)))
        .limit(1);

      if (!agentData.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      // Проверяем, что агент еще не добавлен к встрече
      const existingMeetingAgent = await db
        .select()
        .from(meetingAgents)
        .where(
          and(
            eq(meetingAgents.meetingId, input.meetingId),
            eq(meetingAgents.agentId, input.agentId)
          )
        )
        .limit(1);

      if (existingMeetingAgent.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Agent is already added to this meeting",
        });
      }

      // Добавляем агента к встрече
      const newMeetingAgent = await db
        .insert(meetingAgents)
        .values({
          meetingId: input.meetingId,
          agentId: input.agentId,
          role: input.role,
          isActive: true,
        })
        .returning();

      return newMeetingAgent[0];
    }),

  // Удалить агента из встречи
  removeFromMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        agentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что встреча принадлежит пользователю
      const meeting = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, input.meetingId), eq(meetings.userId, ctx.auth.user.id)))
        .limit(1);

      if (!meeting.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      // Удаляем агента из встречи
      await db
        .delete(meetingAgents)
        .where(
          and(
            eq(meetingAgents.meetingId, input.meetingId),
            eq(meetingAgents.agentId, input.agentId)
          )
        );

      return { success: true };
    }),

  // Обновить роль агента в встрече
  updateRole: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        agentId: z.string(),
        role: z.enum(["moderator", "participant", "observer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что встреча принадлежит пользователю
      const meeting = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, input.meetingId), eq(meetings.userId, ctx.auth.user.id)))
        .limit(1);

      if (!meeting.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      // Обновляем роль агента
      const updatedMeetingAgent = await db
        .update(meetingAgents)
        .set({ role: input.role })
        .where(
          and(
            eq(meetingAgents.meetingId, input.meetingId),
            eq(meetingAgents.agentId, input.agentId)
          )
        )
        .returning();

      if (!updatedMeetingAgent.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found in meeting",
        });
      }

      return updatedMeetingAgent[0];
    }),

  // Переключить активность агента в встрече
  toggleActive: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        agentId: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что встреча принадлежит пользователю
      const meeting = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, input.meetingId), eq(meetings.userId, ctx.auth.user.id)))
        .limit(1);

      if (!meeting.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      // Обновляем активность агента
      const updatedMeetingAgent = await db
        .update(meetingAgents)
        .set({ 
          isActive: input.isActive,
          leftAt: input.isActive ? null : new Date(),
        })
        .where(
          and(
            eq(meetingAgents.meetingId, input.meetingId),
            eq(meetingAgents.agentId, input.agentId)
          )
        )
        .returning();

      if (!updatedMeetingAgent.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found in meeting",
        });
      }

      return updatedMeetingAgent[0];
    }),

  // Получить доступных агентов для добавления к встрече
  getAvailableAgents: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Получаем всех агентов пользователя
      const allAgents = await db
        .select()
        .from(agent)
        .where(and(eq(agent.userId, ctx.auth.user.id), eq(agent.isActive, true)));

      // Получаем агентов, уже добавленных к встрече
      const meetingAgentsList = await db
        .select({ agentId: meetingAgents.agentId })
        .from(meetingAgents)
        .where(eq(meetingAgents.meetingId, input.meetingId));

      const addedAgentIds = new Set(meetingAgentsList.map(ma => ma.agentId));

      // Фильтруем агентов, которые еще не добавлены к встрече
      const availableAgents = allAgents.filter(agent => !addedAgentIds.has(agent.id));

      return availableAgents;
    }),
});
