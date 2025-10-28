import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../init";
import { sessions, sessionParticipants, user, agent, meetingSessions, meetings } from "@/db/schema";
import { eq, and, desc, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { generateSessionCode, isValidSessionCode } from "@/lib/session-code";

export const sessionsRouter = createTRPCRouter({
  // Create a new session
  create: protectedProcedure
    .input(z.object({
      type: z.enum(["chat", "call", "meeting"]),
      meetingId: z.string().optional(),
      invitees: z.array(z.string()).optional(), // User IDs to invite
      withAgents: z.array(z.string()).optional(), // Agent IDs to include
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate unique session code
      let code: string;
      let attempts = 0;
      do {
        code = generateSessionCode();
        attempts++;
        
        // Check if code already exists
        const existing = await db
          .select()
          .from(sessions)
          .where(eq(sessions.code, code))
          .limit(1);
        
        if (existing.length === 0) break;
        
        if (attempts > 10) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate unique session code",
          });
        }
      } while (true);

      // Create session
      const [newSession] = await db
        .insert(sessions)
        .values({
          code,
          type: input.type,
          hostUserId: ctx.auth.user.id,
          expiresAt: input.expiresAt,
        })
        .returning();

      // Add host as participant
      await db
        .insert(sessionParticipants)
        .values({
          sessionId: newSession.id,
          userId: ctx.auth.user.id,
          role: "host",
        });

      // Add invited users as participants
      if (input.invitees && input.invitees.length > 0) {
        await db
          .insert(sessionParticipants)
          .values(
            input.invitees.map(userId => ({
              sessionId: newSession.id,
              userId,
              role: "participant" as const,
            }))
          );
      }

      // Add agents as participants
      if (input.withAgents && input.withAgents.length > 0) {
        // Verify agents belong to user
        const userAgents = await db
          .select()
          .from(agent)
          .where(and(
            eq(agent.userId, ctx.auth.user.id),
            eq(agent.isActive, true)
          ));

        const validAgentIds = userAgents.map(a => a.id);
        const agentsToAdd = input.withAgents.filter(id => validAgentIds.includes(id));

        if (agentsToAdd.length > 0) {
          await db
            .insert(sessionParticipants)
            .values(
              agentsToAdd.map(agentId => ({
                sessionId: newSession.id,
                agentId,
                role: "participant" as const,
              }))
            );
        }
      }

      return newSession;
    }),

  // Join a session by code
  join: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!isValidSessionCode(input.code)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid session code format",
        });
      }

      // Find session
      const [session] = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.code, input.code),
          eq(sessions.status, "active")
        ))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found or has ended",
        });
      }

      // Check if session has expired
      if (session.expiresAt && session.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Session has expired",
        });
      }

      // Check if user is already a participant
      const existingParticipant = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, session.id),
          eq(sessionParticipants.userId, ctx.auth.user.id)
        ))
        .limit(1);

      if (existingParticipant.length > 0) {
        // Update existing participant to active
        await db
          .update(sessionParticipants)
          .set({
            isActive: true,
            leftAt: null,
          })
          .where(eq(sessionParticipants.id, existingParticipant[0].id));

        return { session, joined: false };
      }

      // Restrict access: only host or pre-invited participants may join
      const isHost = session.hostUserId === ctx.auth.user.id;
      if (!isHost) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not invited to this session",
        });
      }

      // Host joining first time: add as participant
      await db
        .insert(sessionParticipants)
        .values({
          sessionId: session.id,
          userId: ctx.auth.user.id,
          role: "host",
        });

      return { session, joined: true };
    }),

  // Leave a session
  leave: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find participant
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
          code: "NOT_FOUND",
          message: "You are not a participant in this session",
        });
      }

      // Update participant to inactive
      await db
        .update(sessionParticipants)
        .set({
          isActive: false,
          leftAt: new Date(),
        })
        .where(eq(sessionParticipants.id, participant.id));

      return { success: true };
    }),

  // End a session (host only)
  end: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is host
      const [session] = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.id, input.sessionId),
          eq(sessions.hostUserId, ctx.auth.user.id)
        ))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found or you are not the host",
        });
      }

      // Update session status
      await db
        .update(sessions)
        .set({
          status: "ended",
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, input.sessionId));

      // Mark all participants as inactive
      await db
        .update(sessionParticipants)
        .set({
          isActive: false,
          leftAt: new Date(),
        })
        .where(eq(sessionParticipants.sessionId, input.sessionId));

      return { success: true };
    }),

  // Get session by code
  getByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!isValidSessionCode(input.code)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid session code format",
        });
      }

      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.code, input.code))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return session;
    }),

  // Get session by meetingId
  getByMeetingId: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ input }) => {
      const rows = await db
        .select({ s: sessions })
        .from(meetingSessions)
        .innerJoin(sessions, eq(meetingSessions.sessionId, sessions.id))
        .where(eq(meetingSessions.meetingId, input.meetingId))
        .limit(1);
      if (rows.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session for meeting not found" });
      }
      return rows[0].s;
    }),

  // Get session by ID
  getById: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return session;
    }),

  // List user's sessions
  list: protectedProcedure
    .input(z.object({
      type: z.enum(["chat", "call", "meeting"]).optional(),
      status: z.enum(["active", "ended", "expired"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const whereConditions = [
        eq(sessionParticipants.userId, ctx.auth.user.id),
        eq(sessionParticipants.isActive, true)
      ];

      const sessionList = await db
        .select({
          id: sessions.id,
          code: sessions.code,
          type: sessions.type,
          status: sessions.status,
          hostUserId: sessions.hostUserId,
          createdAt: sessions.createdAt,
          updatedAt: sessions.updatedAt,
          expiresAt: sessions.expiresAt,
        })
        .from(sessions)
        .innerJoin(sessionParticipants, eq(sessions.id, sessionParticipants.sessionId))
        .where(and(...whereConditions))
        .orderBy(desc(sessions.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      return sessionList;
    }),

  // Invite users/agents to session
  invite: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      users: z.array(z.string()).optional(),
      agents: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is host or cohost
      const [participant] = await db
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

      if (!participant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to invite participants",
        });
      }

      const newParticipants = [];

      // Add invited users
      if (input.users && input.users.length > 0) {
        for (const userId of input.users) {
          // Check if user is already a participant
          const existing = await db
            .select()
            .from(sessionParticipants)
            .where(and(
              eq(sessionParticipants.sessionId, input.sessionId),
              eq(sessionParticipants.userId, userId)
            ))
            .limit(1);

          if (existing.length === 0) {
            newParticipants.push({
              sessionId: input.sessionId,
              userId,
              role: "participant" as const,
            });
          }
        }
      }

      // Add invited agents
      if (input.agents && input.agents.length > 0) {
        // Verify agents belong to user
        const userAgents = await db
          .select()
          .from(agent)
          .where(and(
            eq(agent.userId, ctx.auth.user.id),
            eq(agent.isActive, true)
          ));

        const validAgentIds = userAgents.map(a => a.id);

        for (const agentId of input.agents) {
          if (validAgentIds.includes(agentId)) {
            // Check if agent is already a participant
            const existing = await db
              .select()
              .from(sessionParticipants)
              .where(and(
                eq(sessionParticipants.sessionId, input.sessionId),
                eq(sessionParticipants.agentId, agentId)
              ))
              .limit(1);

            if (existing.length === 0) {
              newParticipants.push({
                sessionId: input.sessionId,
                agentId,
                role: "participant" as const,
              });
            }
          }
        }
      }

      if (newParticipants.length > 0) {
        await db
          .insert(sessionParticipants)
          .values(newParticipants);
      }

      return { invited: newParticipants.length };
    }),

  // Backfill sessions for existing meetings without sessions (current user)
  backfillForMeetings: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Find meetings owned by user that have no linked session
      const withoutSession = await db
        .select({ m: meetings })
        .from(meetings)
        .leftJoin(meetingSessions, eq(meetingSessions.meetingId, meetings.id))
        .where(and(
          eq(meetings.userId, ctx.auth.user.id),
          isNull(meetingSessions.sessionId as any)
        ));

      let created = 0;
      for (const row of withoutSession) {
        const meeting = row.m;
        // create unique code
        let code: string; let attempts = 0;
        do {
          code = generateSessionCode();
          attempts++;
          const existing = await db.select().from(sessions).where(eq(sessions.code, code)).limit(1);
          if (existing.length === 0) break;
        } while (attempts < 10);

        const [s] = await db.insert(sessions).values({
          code,
          type: "meeting",
          hostUserId: meeting.userId,
        }).returning();

        await db.insert(meetingSessions).values({ meetingId: meeting.id, sessionId: s.id });
        await db.insert(sessionParticipants).values({ sessionId: s.id, userId: meeting.userId, role: "host" });
        created++;
      }
      return { created };
    }),
});
