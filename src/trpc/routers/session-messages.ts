import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../init";
import { sessionMessages, sessionParticipants, sessions, user, agent } from "@/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { db } from "@/db";

export const sessionMessagesRouter = createTRPCRouter({
  // Send a message to a session
  send: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      content: z.string().min(1, "Message content is required").max(1000, "Message too long"),
      type: z.enum(["text", "system"]).default("text"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is a participant in the session
      const [participant] = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, input.sessionId),
          eq(sessionParticipants.userId, ctx.auth.user.id),
          eq(sessionParticipants.isActive, true)
        ))
        .limit(1);

      if (!participant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant in this session",
        });
      }

      // Verify session is active
      const [session] = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.id, input.sessionId),
          eq(sessions.status, "active")
        ))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found or has ended",
        });
      }

      // Create message
      const [newMessage] = await db
        .insert(sessionMessages)
        .values({
          sessionId: input.sessionId,
          senderUserId: ctx.auth.user.id,
          content: input.content,
          type: input.type,
        })
        .returning();

      return newMessage;
    }),

  // Get messages from a session
  list: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      cursor: z.string().optional(), // For pagination
      limit: z.number().min(1).max(100).default(50),
    }))
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

      // Build where conditions
      const whereConditions = [eq(sessionMessages.sessionId, input.sessionId)];

      // Add cursor for pagination
      if (input.cursor) {
        whereConditions.push(eq(sessionMessages.id, input.cursor));
      }

      // Get messages with sender info
      const messages = await db
        .select({
          id: sessionMessages.id,
          sessionId: sessionMessages.sessionId,
          senderUserId: sessionMessages.senderUserId,
          senderAgentId: sessionMessages.senderAgentId,
          content: sessionMessages.content,
          type: sessionMessages.type,
          createdAt: sessionMessages.createdAt,
          sender: {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            agentId: agent.id,
            agentName: agent.name,
          },
        })
        .from(sessionMessages)
        .leftJoin(user, eq(sessionMessages.senderUserId, user.id))
        .leftJoin(agent, eq(sessionMessages.senderAgentId, agent.id))
        .where(and(...whereConditions))
        .orderBy(desc(sessionMessages.createdAt))
        .limit(input.limit);

      // Transform the data to include sender info
      const transformedMessages = messages.map(msg => ({
        id: msg.id,
        sessionId: msg.sessionId,
        senderUserId: msg.senderUserId,
        senderAgentId: msg.senderAgentId,
        content: msg.content,
        type: msg.type,
        createdAt: msg.createdAt,
        sender: msg.senderUserId ? {
          type: "user" as const,
          id: msg.sender.userId,
          name: msg.sender.userName,
          email: msg.sender.userEmail,
        } : msg.senderAgentId ? {
          type: "agent" as const,
          id: msg.sender.agentId,
          name: msg.sender.agentName,
        } : null,
      }));

      return {
        messages: transformedMessages,
        nextCursor: transformedMessages.length === input.limit 
          ? transformedMessages[transformedMessages.length - 1]?.id 
          : null,
      };
    }),

  // Get recent messages (for real-time updates)
  getRecent: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      since: z.date().optional(), // Get messages since this date
    }))
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

      const whereConditions = [eq(sessionMessages.sessionId, input.sessionId)];

      if (input.since) {
        whereConditions.push(eq(sessionMessages.createdAt, input.since));
      }

      const messages = await db
        .select({
          id: sessionMessages.id,
          sessionId: sessionMessages.sessionId,
          senderUserId: sessionMessages.senderUserId,
          senderAgentId: sessionMessages.senderAgentId,
          content: sessionMessages.content,
          type: sessionMessages.type,
          createdAt: sessionMessages.createdAt,
          sender: {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            agentId: agent.id,
            agentName: agent.name,
          },
        })
        .from(sessionMessages)
        .leftJoin(user, eq(sessionMessages.senderUserId, user.id))
        .leftJoin(agent, eq(sessionMessages.senderAgentId, agent.id))
        .where(and(...whereConditions))
        .orderBy(desc(sessionMessages.createdAt))
        .limit(100);

      return messages.map(msg => ({
        id: msg.id,
        sessionId: msg.sessionId,
        senderUserId: msg.senderUserId,
        senderAgentId: msg.senderAgentId,
        content: msg.content,
        type: msg.type,
        createdAt: msg.createdAt,
        sender: msg.senderUserId ? {
          type: "user" as const,
          id: msg.sender.userId,
          name: msg.sender.userName,
          email: msg.sender.userEmail,
        } : msg.senderAgentId ? {
          type: "agent" as const,
          id: msg.sender.agentId,
          name: msg.sender.agentName,
        } : null,
      }));
    }),
});
