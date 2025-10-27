import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './routers/_app';

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Meeting = RouterOutputs['meetings']['getOne'];
export type Meetings = RouterOutputs['meetings']['getMany'];
export type UpcomingMeetings = RouterOutputs['meetings']['getUpcoming'];
export type RecentMeetings = RouterOutputs['meetings']['getHistory'];

export type Recording = RouterOutputs['recordings']['getByMeeting'][0];
export type Recordings = RouterOutputs['recordings']['getByMeeting'];

export type Transcript = RouterOutputs['transcripts']['getByMeeting'];
export type TranscriptSummary = RouterOutputs['transcripts']['getSummary'];

export type Agent = RouterOutputs['agents']['getMany'][0];
export type Agents = RouterOutputs['agents']['getMany'];
