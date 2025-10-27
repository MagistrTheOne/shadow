import { db } from "@/db";
import { meetings, meetingParticipants, agents } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { z } from "zod";

const meetingCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  agentId: z.string().optional(),
  scheduledAt: z.date().optional(),
});

const meetingUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  agentId: z.string().optional(),
  scheduledAt: z.date().optional(),
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

      return createdMeeting;
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

  getMany: protectedProcedure
    .input(z.object({
      status: z.enum(["scheduled", "active", "completed", "cancelled"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const whereConditions = [eq(meetings.userId, ctx.auth.user.id)];
      
      if (input.status) {
        whereConditions.push(eq(meetings.status, input.status));
      }

      const data = await db
        .select()
        .from(meetings)
        .where(and(...whereConditions))
        .orderBy(desc(meetings.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return data;
    }),

  update: protectedProcedure
    .input(meetingUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(meetings.id, id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .returning();

      return updatedMeeting;
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Получаем оригинальную встречу
      const [originalMeeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!originalMeeting) {
        throw new Error("Meeting not found");
      }

      // Создаем дубликат с новым ID и названием
      const [duplicatedMeeting] = await db
        .insert(meetings)
        .values({
          title: `${originalMeeting.title} (Copy)`,
          description: originalMeeting.description,
          agentId: originalMeeting.agentId,
          userId: ctx.auth.user.id,
          scheduledAt: null, // Сбрасываем время для новой встречи
          status: "scheduled",
        })
        .returning();

      return duplicatedMeeting;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        );

      return { success: true };
    }),

  start: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          status: "active",
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .returning();

      return updatedMeeting;
    }),

  end: protectedProcedure
    .input(z.object({ id: z.string() }))
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

      const duration = meeting.startedAt 
        ? Math.floor((Date.now() - meeting.startedAt.getTime()) / 1000)
        : 0;

      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          status: "completed",
          endedAt: new Date(),
          duration,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .returning();

      return updatedMeeting;
    }),

  getUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
      const data = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            eq(meetings.status, "scheduled"),
            gte(meetings.scheduledAt, new Date())
          )
        )
        .orderBy(meetings.scheduledAt);

      return data;
    }),

  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const data = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            eq(meetings.status, "completed")
          )
        )
        .orderBy(desc(meetings.endedAt))
        .limit(input.limit)
        .offset(input.offset);

      return data;
    }),
});
