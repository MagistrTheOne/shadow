import { db } from "@/db";
import { recordings, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getSignedUrlForS3 } from "@/lib/s3-utils";

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

      // Generate presigned URL for S3 if file is stored in S3
      const fileUrl = recording.recording.fileUrl;
      let downloadUrl = fileUrl;
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      try {
        // Try to generate presigned URL if it's an S3 file
        if (fileUrl.includes('amazonaws.com') || fileUrl.includes('s3')) {
          downloadUrl = await getSignedUrlForS3(fileUrl, 3600);
        }
      } catch (error) {
        console.error('Failed to generate presigned URL, using direct URL:', error);
        // Fallback to direct URL if presigned URL generation fails
      }

      return {
        downloadUrl,
        expiresAt,
      };
    }),
});
