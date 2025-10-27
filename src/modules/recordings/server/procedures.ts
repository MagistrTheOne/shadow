import { db } from "@/db";
import { recordings, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const recordingsRouter = createTRPCRouter({
  getByMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify user owns the meeting
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!meeting) {
        throw new Error("Meeting not found");
      }

      const data = await db
        .select()
        .from(recordings)
        .where(eq(recordings.meetingId, input.meetingId));

      return data;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [recording] = await db
        .select({
          recording: recordings,
          meeting: meetings,
        })
        .from(recordings)
        .innerJoin(meetings, eq(recordings.meetingId, meetings.id))
        .where(
          and(
            eq(recordings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      return recording;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify user owns the meeting
      const [recording] = await db
        .select({
          recording: recordings,
          meeting: meetings,
        })
        .from(recordings)
        .innerJoin(meetings, eq(recordings.meetingId, meetings.id))
        .where(
          and(
            eq(recordings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!recording) {
        throw new Error("Recording not found");
      }

      await db
        .delete(recordings)
        .where(eq(recordings.id, input.id));

      return { success: true };
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [recording] = await db
        .select({
          recording: recordings,
          meeting: meetings,
        })
        .from(recordings)
        .innerJoin(meetings, eq(recordings.meetingId, meetings.id))
        .where(
          and(
            eq(recordings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!recording) {
        throw new Error("Recording not found");
      }

      // TODO: Generate presigned URL for S3
      // For now, return the file URL directly
      return {
        downloadUrl: recording.recording.fileUrl,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),
});
