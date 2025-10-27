import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: 'shadow-ai',
  eventKey: process.env.INNGEST_EVENT_KEY!
});

// Event types
export interface ProcessRecordingEvent {
  name: 'recording.process';
  data: {
    recordingId: string;
    meetingId: string;
    fileUrl: string;
  };
}

export interface GenerateTranscriptEvent {
  name: 'transcript.generate';
  data: {
    recordingId: string;
    meetingId: string;
    fileUrl: string;
  };
}

export interface SummarizeMeetingEvent {
  name: 'meeting.summarize';
  data: {
    transcriptId: string;
    meetingId: string;
  };
}

export interface SendMeetingReminderEvent {
  name: 'meeting.reminder';
  data: {
    meetingId: string;
    userId: string;
    scheduledAt: string;
  };
}

export interface CleanupExpiredRecordingsEvent {
  name: 'recordings.cleanup';
  data: {
    olderThanDays: number;
  };
}

export interface SyncSubscriptionStatusEvent {
  name: 'subscription.sync';
  data: {
    subscriptionId: string;
    userId: string;
  };
}
