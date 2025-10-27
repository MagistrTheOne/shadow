import { inngest } from '@/lib/inngest';
import { db } from '@/db';
import { recordings, transcripts, transcriptSummaries, meetings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { transcribeAudio, formatTranscript } from '@/lib/deepgram';
import { generateSummary } from '@/lib/gigachat-summary';
import { logger } from '@/lib/logger';

// Process recording after meeting ends
export const processRecording = inngest.createFunction(
  { id: 'process-recording' },
  { event: 'recording.process' },
  async ({ event, step }) => {
    const { recordingId, meetingId, fileUrl } = event.data;

    logger.info('Starting recording processing', { recordingId, meetingId, fileUrl });

    return await step.run('process-recording', async () => {
      try {
        // Update recording status to processing
        await db
          .update(recordings)
          .set({ status: 'processing' })
          .where(eq(recordings.id, recordingId));

        logger.info('Recording status updated to processing', { recordingId });

        // Generate transcript using Deepgram
        await inngest.send({
          name: 'transcript.generate',
          data: { recordingId, meetingId, fileUrl }
        });

        logger.info('Transcript generation triggered', { recordingId, meetingId });

        return { success: true, recordingId };
      } catch (error) {
        logger.error('Failed to process recording', {
          recordingId,
          meetingId,
          error: error instanceof Error ? error.message : String(error)
        });

        // Update recording status to failed
        await db
          .update(recordings)
          .set({ status: 'failed' })
          .where(eq(recordings.id, recordingId));

        throw error;
      }
    });
  }
);

// Generate transcript from recording
export const generateTranscript = inngest.createFunction(
  { id: 'generate-transcript' },
  { event: 'transcript.generate' },
  async ({ event, step }) => {
    const { recordingId, meetingId, fileUrl } = event.data;

    logger.info('Starting transcript generation', { recordingId, meetingId, fileUrl });

    return await step.run('generate-transcript', async () => {
      try {
        // Transcribe audio using Deepgram
        logger.info('Starting audio transcription with Deepgram', { fileUrl });
        const transcriptResult = await transcribeAudio(fileUrl, 'ru');
        const transcriptText = formatTranscript(transcriptResult);
        const wordCount = transcriptText.split(' ').length;

        logger.info('Audio transcription completed', { wordCount, fileUrl });

        // Save transcript to database
        const [transcript] = await db
          .insert(transcripts)
          .values({
            meetingId,
            content: transcriptText,
            language: 'ru',
            wordCount,
            status: 'ready',
          })
          .returning();

        logger.info('Transcript saved to database', { transcriptId: transcript.id, wordCount });

        // Update recording status to ready
        await db
          .update(recordings)
          .set({ status: 'ready' })
          .where(eq(recordings.id, recordingId));

        logger.info('Recording status updated to ready', { recordingId });

        // Generate summary
        await inngest.send({
          name: 'meeting.summarize',
          data: { transcriptId: transcript.id, meetingId }
        });

        logger.info('Summary generation triggered', { transcriptId: transcript.id, meetingId });

        return { success: true, transcriptId: transcript.id, wordCount };
      } catch (error) {
        logger.error('Failed to generate transcript', {
          recordingId,
          meetingId,
          fileUrl,
          error: error instanceof Error ? error.message : String(error)
        });

        // Update transcript status to failed
        await db
          .update(transcripts)
          .set({ status: 'failed' })
          .where(eq(transcripts.meetingId, meetingId));

        throw error;
      }
    });
  }
);

// Summarize meeting transcript
export const summarizeMeeting = inngest.createFunction(
  { id: 'summarize-meeting' },
  { event: 'meeting.summarize' },
  async ({ event, step }) => {
    const { transcriptId, meetingId } = event.data;

    logger.info('Starting meeting summary generation', { transcriptId, meetingId });

    return await step.run('summarize-meeting', async () => {
      try {
        // Get transcript
        const [transcript] = await db
          .select()
          .from(transcripts)
          .where(eq(transcripts.id, transcriptId))
          .limit(1);

        if (!transcript) {
          logger.error('Transcript not found', { transcriptId, meetingId });
          throw new Error('Transcript not found');
        }

        logger.info('Transcript retrieved for summarization', {
          transcriptId,
          wordCount: transcript.wordCount
        });

        // Generate AI summary using Gigachat
        logger.info('Generating AI summary with Gigachat', { transcriptId });
        const summary = await generateSummary(transcript.content);

        logger.info('AI summary generated successfully', {
          transcriptId,
          summaryLength: summary.length
        });

        // Save summary to database
        await db
          .insert(transcriptSummaries)
          .values({
            transcriptId,
            summary,
            keyPoints: null, // TODO: Extract key points
            actionItems: null, // TODO: Extract action items
          });

        logger.info('Meeting summary saved to database', { transcriptId, meetingId });

        return { success: true, summary, summaryLength: summary.length };
      } catch (error) {
        logger.error('Failed to summarize meeting', {
          transcriptId,
          meetingId,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });
  }
);

// Send meeting reminders
export const sendMeetingReminders = inngest.createFunction(
  { id: 'send-meeting-reminders' },
  { event: 'meeting.reminder' },
  async ({ event, step }) => {
    const { meetingId, userId, scheduledAt } = event.data;

    logger.info('Sending meeting reminder', { meetingId, userId, scheduledAt });

    return await step.run('send-meeting-reminders', async () => {
      try {
        // TODO: Implement email/push notification sending
        // For now, just log the reminder
        logger.info('Meeting reminder sent', { meetingId, userId, scheduledAt });

        return { success: true, meetingId, userId };
      } catch (error) {
        logger.error('Failed to send meeting reminder', {
          meetingId,
          userId,
          scheduledAt,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });
  }
);

// Cleanup expired recordings
export const cleanupExpiredRecordings = inngest.createFunction(
  { id: 'cleanup-expired-recordings' },
  { event: 'recordings.cleanup' },
  async ({ event, step }) => {
    const { olderThanDays } = event.data;

    logger.info('Starting cleanup of expired recordings', { olderThanDays });

    return await step.run('cleanup-expired-recordings', async () => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        logger.info('Cleanup cutoff date calculated', {
          olderThanDays,
          cutoffDate: cutoffDate.toISOString()
        });

        // TODO: Implement cleanup logic
        // 1. Find recordings older than cutoff date
        // 2. Delete files from S3
        // 3. Remove database records

        // For now, just log the operation
        logger.info('Expired recordings cleanup completed', {
          olderThanDays,
          cutoffDate: cutoffDate.toISOString()
        });

        return { success: true, olderThanDays, cutoffDate: cutoffDate.toISOString() };
      } catch (error) {
        logger.error('Failed to cleanup expired recordings', {
          olderThanDays,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });
  }
);

// Sync subscription status with Polar
export const syncSubscriptionStatus = inngest.createFunction(
  { id: 'sync-subscription-status' },
  { event: 'subscription.sync' },
  async ({ event, step }) => {
    const { subscriptionId, userId } = event.data;

    logger.info('Starting subscription status sync', { subscriptionId, userId });

    return await step.run('sync-subscription-status', async () => {
      try {
        // TODO: Implement Polar subscription sync
        // 1. Get subscription from Polar
        // 2. Update local subscription status
        // 3. Handle cancellations, renewals, etc.

        logger.info('Subscription sync completed', { subscriptionId, userId });

        return { success: true, subscriptionId, userId };
      } catch (error) {
        logger.error('Failed to sync subscription status', {
          subscriptionId,
          userId,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    });
  }
);
