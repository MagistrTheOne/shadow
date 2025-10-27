import { db } from "@/db";
import { transcripts, transcriptSummaries, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { generateSummary, answerQuestion } from "@/lib/gigachat";

export const transcriptsRouter = createTRPCRouter({
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

      const [transcript] = await db
        .select()
        .from(transcripts)
        .where(eq(transcripts.meetingId, input.meetingId))
        .limit(1);

      return transcript;
    }),

  getSummary: protectedProcedure
    .input(z.object({ transcriptId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [summary] = await db
        .select({
          summary: transcriptSummaries,
          transcript: transcripts,
          meeting: meetings,
        })
        .from(transcriptSummaries)
        .innerJoin(transcripts, eq(transcriptSummaries.transcriptId, transcripts.id))
        .innerJoin(meetings, eq(transcripts.meetingId, meetings.id))
        .where(
          and(
            eq(transcriptSummaries.transcriptId, input.transcriptId),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      return summary;
    }),

  search: protectedProcedure
    .input(z.object({ 
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input, ctx }) => {
      const data = await db
        .select({
          transcript: transcripts,
          meeting: meetings,
        })
        .from(transcripts)
        .innerJoin(meetings, eq(transcripts.meetingId, meetings.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            ilike(transcripts.content, `%${input.query}%`)
          )
        )
        .limit(input.limit);

      return data;
    }),

  askQuestion: protectedProcedure
    .input(z.object({ 
      transcriptId: z.string(),
      question: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get transcript and verify ownership
      const [transcriptData] = await db
        .select({
          transcript: transcripts,
          meeting: meetings,
        })
        .from(transcripts)
        .innerJoin(meetings, eq(transcripts.meetingId, meetings.id))
        .where(
          and(
            eq(transcripts.id, input.transcriptId),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!transcriptData) {
        throw new Error("Transcript not found");
      }

      // Generate AI answer
      const answer = await answerQuestion(
        transcriptData.transcript.content,
        input.question
      );

      return {
        question: input.question,
        answer,
        transcriptId: input.transcriptId,
      };
    }),

  generateSummary: protectedProcedure
    .input(z.object({ transcriptId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Get transcript and verify ownership
      const [transcriptData] = await db
        .select({
          transcript: transcripts,
          meeting: meetings,
        })
        .from(transcripts)
        .innerJoin(meetings, eq(transcripts.meetingId, meetings.id))
        .where(
          and(
            eq(transcripts.id, input.transcriptId),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!transcriptData) {
        throw new Error("Transcript not found");
      }

      // Check if summary already exists
      const [existingSummary] = await db
        .select()
        .from(transcriptSummaries)
        .where(eq(transcriptSummaries.transcriptId, input.transcriptId))
        .limit(1);

      if (existingSummary) {
        return existingSummary;
      }

      // Generate AI summary
      const summary = await generateSummary(transcriptData.transcript.content);

      // Save summary to database
      const [createdSummary] = await db
        .insert(transcriptSummaries)
        .values({
          transcriptId: input.transcriptId,
          summary,
          keyPoints: null, // TODO: Extract key points
          actionItems: null, // TODO: Extract action items
        })
        .returning();

      return createdSummary;
    }),
});
