import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { 
  processRecording, 
  generateTranscript, 
  summarizeMeeting, 
  sendMeetingReminders, 
  cleanupExpiredRecordings, 
  syncSubscriptionStatus 
} from '@/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processRecording,
    generateTranscript,
    summarizeMeeting,
    sendMeetingReminders,
    cleanupExpiredRecordings,
    syncSubscriptionStatus,
  ],
});
