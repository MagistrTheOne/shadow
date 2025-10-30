import { inngest } from '@/lib/inngest';
import { db } from '@/db';
import { recordings, transcripts, transcriptSummaries, meetings, user, notifications, subscriptions } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';
import { transcribeAudio, formatTranscript } from '@/lib/deepgram';
import { generateSummary, generateKeyPoints, generateActionItems } from '@/lib/gigachat-summary';
import { logger } from '@/lib/logger';
import { getPolarSubscription } from '@/lib/polar';
import { deleteS3Files } from '@/lib/s3-utils';
import { sendMeetingReminderEmail } from '@/lib/email';

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

        // Extract key points and action items
        logger.info('Extracting key points and action items', { transcriptId });
        const [keyPoints, actionItems] = await Promise.all([
          generateKeyPoints(transcript.content),
          generateActionItems(transcript.content)
        ]);

        // Save summary to database
        await db
          .insert(transcriptSummaries)
          .values({
            transcriptId,
            summary,
            keyPoints: keyPoints.length > 0 ? keyPoints : null,
            actionItems: actionItems.length > 0 ? actionItems : null,
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
        // Получаем данные о встрече
        const meeting = await db
          .select()
          .from(meetings)
          .where(eq(meetings.id, meetingId))
          .limit(1);

        if (!meeting.length) {
          logger.warn('Meeting not found for reminder', { meetingId });
          return { success: false, meetingId, userId, reason: 'Meeting not found' };
        }

        // Получаем данные о пользователе
        const userData = await db
          .select()
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);

        if (!userData.length) {
          logger.warn('User not found for reminder', { userId });
          return { success: false, meetingId, userId, reason: 'User not found' };
        }

        // Создаем уведомление в базе данных
        await db.insert(notifications).values({
          userId: userId,
          type: 'meeting_reminder',
          fromUserId: null,
          metadata: {
            meetingId: meetingId,
            meetingTitle: meeting[0].title,
            scheduledAt: scheduledAt
          },
          isRead: false
        });

        // Send email notification
        if (userData[0].email) {
          await sendMeetingReminderEmail(
            userData[0].email,
            userData[0].name || 'User',
            meeting[0].title,
            meetingId,
            scheduledAt
          );
        }
        
        logger.info('Meeting reminder sent', { 
          meetingId, 
          userId, 
          scheduledAt,
          meetingTitle: meeting[0].title 
        });

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

        // 1. Find recordings older than cutoff date
        const expiredRecordings = await db
          .select()
          .from(recordings)
          .where(lt(recordings.createdAt, cutoffDate));

        logger.info('Found expired recordings', { 
          count: expiredRecordings.length,
          cutoffDate: cutoffDate.toISOString()
        });

        // 2. Delete files from S3
        const fileUrls = expiredRecordings
          .map(r => r.fileUrl)
          .filter(url => url && url.length > 0);
        
        if (fileUrls.length > 0) {
          logger.info('Deleting files from S3', { count: fileUrls.length });
          await deleteS3Files(fileUrls);
        }

        // 3. Remove database records (cascade deletion handled by DB schema)
        for (const recording of expiredRecordings) {
          // Drizzle ORM will cascade delete related transcripts via foreign key constraints
          await db.delete(recordings).where(eq(recordings.id, recording.id));
        }

        logger.info('Expired recordings cleanup completed', {
          olderThanDays,
          cutoffDate: cutoffDate.toISOString(),
          deletedCount: expiredRecordings.length
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
        // 1. Get subscription from Polar API
        const polarSubscription = await getPolarSubscription(subscriptionId);
        
        // 2. Update local subscription status
        await db.update(subscriptions).set({
          status: polarSubscription.status === 'active' ? 'active' : 
                  polarSubscription.status === 'cancelled' ? 'cancelled' : 'expired',
          currentPeriodStart: polarSubscription.current_period_start ? new Date(polarSubscription.current_period_start) : undefined,
          currentPeriodEnd: polarSubscription.current_period_end ? new Date(polarSubscription.current_period_end) : undefined,
          updatedAt: new Date()
        }).where(eq(subscriptions.id, subscriptionId));

        // 3. Handle cancellations - downgrade to free plan
        if (polarSubscription.status === 'cancelled' || polarSubscription.status === 'expired') {
          await db.update(subscriptions).set({
            plan: 'free',
            status: 'expired'
          }).where(eq(subscriptions.id, subscriptionId));
        }

        logger.info('Subscription sync completed', { subscriptionId, userId, status: polarSubscription.status });

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
