//agents Router
import { agentsRouter } from './agents';
import { chatsRouter } from './chats';
import { meetingAgentsRouter } from './meeting-agents';
import { sessionsRouter } from './sessions';
import { sessionMessagesRouter } from './session-messages';
import { sessionParticipantsRouter } from './session-participants';
import { usersRouter } from './users';
import { friendsRouter } from './friends';
import { notificationsRouter } from './notifications';
import { meetingsRouter } from '@/modules/meetings/server/procedures';
import { recordingsRouter } from '@/modules/recordings/server/procedures';
import { transcriptsRouter } from '@/modules/transcripts/server/procedures';
import { subscriptionsRouter } from '@/modules/subscriptions/server/procedures';
import { streamRouter } from './stream';

import {  createTRPCRouter } from '../init';
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  chats: chatsRouter,
  meetingAgents: meetingAgentsRouter,
  sessions: sessionsRouter,
  sessionMessages: sessionMessagesRouter,
  sessionParticipants: sessionParticipantsRouter,
  users: usersRouter,
  friends: friendsRouter,
  notifications: notificationsRouter,
  meetings: meetingsRouter,
  recordings: recordingsRouter,
  transcripts: transcriptsRouter,
  subscriptions: subscriptionsRouter,
  stream: streamRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;