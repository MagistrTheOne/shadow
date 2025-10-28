//agents Router
import { agentsRouter } from './agents';
import { meetingAgentsRouter } from './meeting-agents';
import { sessionsRouter } from './sessions';
import { sessionMessagesRouter } from './session-messages';
import { sessionParticipantsRouter } from './session-participants';
import { meetingsRouter } from '@/modules/meetings/server/procedures';
import { recordingsRouter } from '@/modules/recordings/server/procedures';
import { transcriptsRouter } from '@/modules/transcripts/server/procedures';
import { subscriptionsRouter } from '@/modules/subscriptions/server/procedures';

import {  createTRPCRouter } from '../init';
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetingAgents: meetingAgentsRouter,
  sessions: sessionsRouter,
  sessionMessages: sessionMessagesRouter,
  sessionParticipants: sessionParticipantsRouter,
  meetings: meetingsRouter,
  recordings: recordingsRouter,
  transcripts: transcriptsRouter,
  subscriptions: subscriptionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;