import { db } from "@/db";
import { meetings, meetingParticipants, sessions, meetingSessions, notifications, usageMetrics, recordings, transcripts } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { generateSessionCode } from "@/lib/session-code";

const meetingCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduledAt: z.date().optional(),
  duration: z.number().optional(),
  isRecurring: z.boolean().optional(),
  recurringType: z.enum(["daily", "weekly", "monthly"]).optional(),
  invitedFriends: z.array(z.string()).optional(),
});

const meetingUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  scheduledAt: z.date().optional(),
  duration: z.number().optional(),
  isRecurring: z.boolean().optional(),
  recurringType: z.enum(["daily", "weekly", "monthly"]).optional(),
  status: z.enum(["scheduled", "active", "completed", "cancelled"]).optional(),
});

export const meetingsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(meetingCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // Check subscription limits
      const { checkMeetingLimit } = await import("@/lib/subscription-limits");
      const limitCheck = await checkMeetingLimit(ctx.auth.user.id);

      if (!limitCheck.canCreate) {
        throw new Error(`Meeting limit reached. You can create ${limitCheck.limit} meetings per month. Current: ${limitCheck.current}`);
      }

      const [createdMeeting] = await db
        .insert(meetings)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      // Create a session for the meeting
      let sessionCode: string;
      let attempts = 0;
      do {
        sessionCode = generateSessionCode();
        attempts++;
        
        // Check if code already exists
        const existing = await db
          .select()
          .from(sessions)
          .where(eq(sessions.code, sessionCode))
          .limit(1);
        
        if (existing.length === 0) break;
        
        if (attempts > 10) {
          throw new Error("Failed to generate unique session code");
        }
      } while (true);

      const [session] = await db
        .insert(sessions)
        .values({
          code: sessionCode,
          type: "meeting",
          hostUserId: ctx.auth.user.id,
        })
        .returning();

      // Link meeting to session
      await db
        .insert(meetingSessions)
        .values({
          meetingId: createdMeeting.id,
          sessionId: session.id,
        });

      // Send notifications to invited friends
      if (input.invitedFriends && input.invitedFriends.length > 0) {
        const notificationsToCreate = input.invitedFriends.map(friendId => ({
          userId: friendId,
          type: "meeting_invite" as const,
          fromUserId: ctx.auth.user.id,
          metadata: {
            meetingId: createdMeeting.id,
            meetingTitle: createdMeeting.title,
            sessionCode: sessionCode,
          },
        }));

        await db.insert(notifications).values(notificationsToCreate);
      }

      return createdMeeting;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        status: z.enum(["scheduled", "active", "completed", "cancelled"]).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const query = db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            input.status ? eq(meetings.status, input.status) : undefined
          )
        )
        .orderBy(desc(meetings.createdAt))
        .limit(input.limit);

      return query;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      return meeting;
    }),

  update: protectedProcedure
    .input(meetingUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!meeting) {
        throw new Error("Meeting not found");
      }

      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(meetings.id, id))
        .returning();

      return updatedMeeting;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!meeting) {
        throw new Error("Meeting not found");
      }

      await db.delete(meetings).where(eq(meetings.id, input.id));

      return { success: true };
    }),

  start: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!meeting) {
        throw new Error("Meeting not found");
      }

      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          status: "active",
          startedAt: new Date(),
        })
        .where(eq(meetings.id, input.id))
        .returning();

      return updatedMeeting;
    }),

  end: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!meeting) {
        throw new Error("Meeting not found");
      }

      await db
        .update(meetings)
        .set({
          status: "completed",
          endedAt: new Date(),
        })
        .where(eq(meetings.id, input.id));

      return { success: true };
    }),

  getUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
      return await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            eq(meetings.status, "scheduled")
          )
        )
        .orderBy(meetings.scheduledAt)
        .limit(10);
    }),

  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      return await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            eq(meetings.status, "completed")
          )
        )
        .orderBy(desc(meetings.endedAt))
        .limit(input.limit);
    }),

  getAnalytics: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const endDate = input.endDate || new Date();

      // Get meeting statistics
      const meetingStats = await db
        .select({
          status: meetings.status,
          count: sql<number>`count(*)`,
        })
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            gte(meetings.createdAt, startDate),
            lte(meetings.createdAt, endDate)
          )
        )
        .groupBy(meetings.status);

      // Get total duration
      const durationStats = await db
        .select({
          totalDuration: sql<number>`coalesce(sum(${meetings.duration}), 0)`,
          avgDuration: sql<number>`coalesce(avg(${meetings.duration}), 0)`,
        })
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            eq(meetings.status, "completed"),
            gte(meetings.createdAt, startDate),
            lte(meetings.createdAt, endDate)
          )
        );

      // Get recordings statistics
      const recordingStats = await db
        .select({
          totalRecordings: sql<number>`count(*)`,
          totalStorage: sql<number>`coalesce(sum(${recordings.fileSize}), 0)`,
        })
        .from(recordings)
        .innerJoin(meetings, eq(recordings.meetingId, meetings.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            gte(recordings.createdAt, startDate),
            lte(recordings.createdAt, endDate)
          )
        );

      // Get transcript statistics
      const transcriptStats = await db
        .select({
          totalTranscripts: sql<number>`count(*)`,
          totalWords: sql<number>`coalesce(sum(${transcripts.wordCount}), 0)`,
        })
        .from(transcripts)
        .innerJoin(meetings, eq(transcripts.meetingId, meetings.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            gte(transcripts.createdAt, startDate),
            lte(transcripts.createdAt, endDate)
          )
        );

      // Get usage metrics
      const usageStats = await db
        .select({
          totalDuration: sql<number>`coalesce(sum(${usageMetrics.duration}), 0)`,
          totalStorage: sql<number>`coalesce(sum(${usageMetrics.storageUsed}), 0)`,
          totalWords: sql<number>`coalesce(sum(${usageMetrics.transcriptWords}), 0)`,
        })
        .from(usageMetrics)
        .where(
          and(
            eq(usageMetrics.userId, ctx.auth.user.id),
            gte(usageMetrics.date, startDate),
            lte(usageMetrics.date, endDate)
          )
        );

      return {
        meetings: {
          byStatus: meetingStats.reduce((acc, stat) => {
            acc[stat.status] = Number(stat.count);
            return acc;
          }, {} as Record<string, number>),
          totalDuration: Number(durationStats[0]?.totalDuration || 0),
          avgDuration: Number(durationStats[0]?.avgDuration || 0),
        },
        recordings: {
          total: Number(recordingStats[0]?.totalRecordings || 0),
          totalStorageBytes: Number(recordingStats[0]?.totalStorage || 0),
        },
        transcripts: {
          total: Number(transcriptStats[0]?.totalTranscripts || 0),
          totalWords: Number(transcriptStats[0]?.totalWords || 0),
        },
        usage: {
          totalDuration: Number(usageStats[0]?.totalDuration || 0),
          totalStorageBytes: Number(usageStats[0]?.totalStorage || 0),
          totalWords: Number(usageStats[0]?.totalWords || 0),
        },
        period: {
          startDate,
          endDate,
        },
      };
    }),
});