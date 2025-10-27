import { inngest } from '@/lib/inngest';
import { db } from '@/db';
import { recordings, transcripts, transcriptSummaries, meetings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { transcribeAudio, formatTranscript } from '@/lib/deepgram';
import { generateSummary } from '@/lib/gigachat';

// Process recording after meeting ends
export const processRecording = inngest.createFunction(
  { id: 'process-recording' },
  { event: 'recording.process' },
  async ({ event, step }) => {
    const { recordingId, meetingId, fileUrl } = event.data;

    return await step.run('process-recording', async () => {
      // Update recording status to processing
      await db
        .update(recordings)
        .set({ status: 'processing' })
        .where(eq(recordings.id, recordingId));

      try {
        // Generate transcript using Deepgram
        await inngest.send({
          name: 'transcript.generate',
          data: { recordingId, meetingId, fileUrl }
        });

        return { success: true, recordingId };
      } catch (error) {
        console.error('Failed to process recording:', error);
        
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

    return await step.run('generate-transcript', async () => {
      try {
        // Transcribe audio using Deepgram
        const transcriptResult = await transcribeAudio(fileUrl, 'ru');
        const transcriptText = formatTranscript(transcriptResult);

        // Save transcript to database
        const [transcript] = await db
          .insert(transcripts)
          .values({
            meetingId,
            content: transcriptText,
            language: 'ru',
            wordCount: transcriptText.split(' ').length,
            status: 'ready',
          })
          .returning();

        // Update recording status to ready
        await db
          .update(recordings)
          .set({ status: 'ready' })
          .where(eq(recordings.id, recordingId));

        // Generate summary
        await inngest.send({
          name: 'meeting.summarize',
          data: { transcriptId: transcript.id, meetingId }
        });

        return { success: true, transcriptId: transcript.id };
      } catch (error) {
        console.error('Failed to generate transcript:', error);
        
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

    return await step.run('summarize-meeting', async () => {
      try {
        // Get transcript
        const [transcript] = await db
          .select()
          .from(transcripts)
          .where(eq(transcripts.id, transcriptId))
          .limit(1);

        if (!transcript) {
          throw new Error('Transcript not found');
        }

        // Generate AI summary using Gigachat
        const summary = await generateSummary(transcript.content);

        // Save summary to database
        await db
          .insert(transcriptSummaries)
          .values({
            transcriptId,
            summary,
            keyPoints: null, // TODO: Extract key points
            actionItems: null, // TODO: Extract action items
          });

        return { success: true, summary };
      } catch (error) {
        console.error('Failed to summarize meeting:', error);
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

    return await step.run('send-meeting-reminders', async () => {
      // TODO: Implement email/push notification sending
      console.log(`Sending reminder for meeting ${meetingId} to user ${userId} at ${scheduledAt}`);
      
      return { success: true };
    });
  }
);

// Cleanup expired recordings
export const cleanupExpiredRecordings = inngest.createFunction(
  { id: 'cleanup-expired-recordings' },
  { event: 'recordings.cleanup' },
  async ({ event, step }) => {
    const { olderThanDays } = event.data;

    return await step.run('cleanup-expired-recordings', async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // TODO: Implement cleanup logic
      // 1. Find recordings older than cutoff date
      // 2. Delete files from S3
      // 3. Remove database records
      
      console.log(`Cleaning up recordings older than ${olderThanDays} days`);
      
      return { success: true };
    });
  }
);

// Sync subscription status with Polar
export const syncSubscriptionStatus = inngest.createFunction(
  { id: 'sync-subscription-status' },
  { event: 'subscription.sync' },
  async ({ event, step }) => {
    const { subscriptionId, userId } = event.data;

    return await step.run('sync-subscription-status', async () => {
      try {
        // TODO: Implement Polar subscription sync
        // 1. Get subscription from Polar
        // 2. Update local subscription status
        // 3. Handle cancellations, renewals, etc.
        
        console.log(`Syncing subscription ${subscriptionId} for user ${userId}`);
        
        return { success: true };
      } catch (error) {
        console.error('Failed to sync subscription status:', error);
        throw error;
      }
    });
  }
);
