//agents Router
import { agentsRouter } from './agents';
import { meetingsRouter } from '@/modules/meetings/server/procedures';
import { recordingsRouter } from '@/modules/recordings/server/procedures';
import { transcriptsRouter } from '@/modules/transcripts/server/procedures';
import { subscriptionsRouter } from '@/modules/subscriptions/server/procedures';

import {  createTRPCRouter } from '../init';
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,
  recordings: recordingsRouter,
  transcripts: transcriptsRouter,
  subscriptions: subscriptionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;