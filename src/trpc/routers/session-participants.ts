import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../init";
import { sessionParticipants, sessions, user, agent } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { db } from "@/db";

export const sessionParticipantsRouter = createTRPCRouter({
  // List participants in a session
  list: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user is a participant in the session
      const [participant] = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, input.sessionId),
          eq(sessionParticipants.userId, ctx.auth.user.id)
        ))
        .limit(1);

      if (!participant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant in this session",
        });
      }

      // Get all participants with their info
      const participants = await db
        .select({
          id: sessionParticipants.id,
          sessionId: sessionParticipants.sessionId,
          userId: sessionParticipants.userId,
          agentId: sessionParticipants.agentId,
          role: sessionParticipants.role,
          joinedAt: sessionParticipants.joinedAt,
          leftAt: sessionParticipants.leftAt,
          isActive: sessionParticipants.isActive,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
          agent: {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            avatar: agent.avatar,
            provider: agent.provider,
            model: agent.model,
          },
        })
        .from(sessionParticipants)
        .leftJoin(user, eq(sessionParticipants.userId, user.id))
        .leftJoin(agent, eq(sessionParticipants.agentId, agent.id))
        .where(eq(sessionParticipants.sessionId, input.sessionId))
        .orderBy(sessionParticipants.joinedAt);

      // Transform the data
      const transformedParticipants = participants.map(p => ({
        id: p.id,
        sessionId: p.sessionId,
        role: p.role,
        joinedAt: p.joinedAt,
        leftAt: p.leftAt,
        isActive: p.isActive,
        participant: p.userId ? {
          type: "user" as const,
          id: p.user?.id,
          name: p.user?.name,
          email: p.user?.email,
          image: p.user?.image,
        } : p.agentId ? {
          type: "agent" as const,
          id: p.agent?.id,
          name: p.agent?.name,
          description: p.agent?.description,
          avatar: p.agent?.avatar,
          provider: p.agent?.provider,
          model: p.agent?.model,
        } : null,
      }));

      return transformedParticipants;
    }),

  // Toggle participant active status
  toggleActive: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      participantId: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is host or cohost
      const [userParticipant] = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, input.sessionId),
          eq(sessionParticipants.userId, ctx.auth.user.id),
          or(
            eq(sessionParticipants.role, "host"),
            eq(sessionParticipants.role, "cohost")
          )
        ))
        .limit(1);

      if (!userParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to manage participants",
        });
      }

      // Update participant status
      await db
        .update(sessionParticipants)
        .set({
          isActive: input.isActive,
          leftAt: input.isActive ? null : new Date(),
        })
        .where(eq(sessionParticipants.id, input.participantId));

      return { success: true };
    }),

  // Promote/demote participant role
  updateRole: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      participantId: z.string(),
      role: z.enum(["host", "cohost", "participant"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is host
      const [userParticipant] = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, input.sessionId),
          eq(sessionParticipants.userId, ctx.auth.user.id),
          eq(sessionParticipants.role, "host")
        ))
        .limit(1);

      if (!userParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the host can change participant roles",
        });
      }

      // Prevent demoting the host
      const [targetParticipant] = await db
        .select()
        .from(sessionParticipants)
        .where(eq(sessionParticipants.id, input.participantId))
        .limit(1);

      if (targetParticipant?.role === "host" && input.role !== "host") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot demote the host",
        });
      }

      // Update participant role
      await db
        .update(sessionParticipants)
        .set({ role: input.role })
        .where(eq(sessionParticipants.id, input.participantId));

      return { success: true };
    }),

  // Remove participant from session
  remove: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      participantId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is host or cohost
      const [userParticipant] = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, input.sessionId),
          eq(sessionParticipants.userId, ctx.auth.user.id),
          or(
            eq(sessionParticipants.role, "host"),
            eq(sessionParticipants.role, "cohost")
          )
        ))
        .limit(1);

      if (!userParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to remove participants",
        });
      }

      // Prevent removing the host
      const [targetParticipant] = await db
        .select()
        .from(sessionParticipants)
        .where(eq(sessionParticipants.id, input.participantId))
        .limit(1);

      if (targetParticipant?.role === "host") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove the host",
        });
      }

      // Remove participant
      await db
        .delete(sessionParticipants)
        .where(eq(sessionParticipants.id, input.participantId));

      return { success: true };
    }),
});
