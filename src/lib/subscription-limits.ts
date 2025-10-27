import { db } from "@/db";
import { subscriptions, meetings, transcripts, agents } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface SubscriptionLimits {
  meetingsPerMonth: number;
  storageGB: number;
  transcriptWords: number;
  agentsLimit: number;
}

export const PLAN_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    meetingsPerMonth: 5,
    storageGB: 1,
    transcriptWords: 10000,
    agentsLimit: 1,
  },
  pro: {
    meetingsPerMonth: 50,
    storageGB: 100,
    transcriptWords: 100000,
    agentsLimit: 5,
  },
  enterprise: {
    meetingsPerMonth: -1, // unlimited
    storageGB: -1, // unlimited
    transcriptWords: -1, // unlimited
    agentsLimit: -1, // unlimited
  },
};

export async function getUserLimits(userId: string): Promise<SubscriptionLimits> {
  // Get user's current subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  const plan = subscription?.plan || "free";
  return PLAN_LIMITS[plan];
}

export async function checkMeetingLimit(userId: string): Promise<{
  canCreate: boolean;
  current: number;
  limit: number;
}> {
  const limits = await getUserLimits(userId);
  if (limits.meetingsPerMonth === -1) {
    return { canCreate: true, current: 0, limit: -1 };
  }

  // Count meetings in current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(meetings)
    .where(
      and(
        eq(meetings.userId, userId),
        gte(meetings.createdAt, startOfMonth),
        lte(meetings.createdAt, endOfMonth)
      )
    );

  const current = Number(result?.count || 0);
  return {
    canCreate: current < limits.meetingsPerMonth,
    current,
    limit: limits.meetingsPerMonth,
  };
}

export async function checkStorageLimit(userId: string): Promise<{
  canUpload: boolean;
  currentGB: number;
  limitGB: number;
}> {
  const limits = await getUserLimits(userId);
  if (limits.storageGB === -1) {
    return { canUpload: true, currentGB: 0, limitGB: -1 };
  }

  // Calculate current storage usage
  // This is a simplified calculation - in production you'd sum file sizes
  const currentGB = 0; // TODO: Implement actual storage calculation

  return {
    canUpload: currentGB < limits.storageGB,
    currentGB,
    limitGB: limits.storageGB,
  };
}

export async function checkTranscriptLimit(userId: string): Promise<{
  canTranscribe: boolean;
  currentWords: number;
  limitWords: number;
}> {
  const limits = await getUserLimits(userId);
  if (limits.transcriptWords === -1) {
    return { canTranscribe: true, currentWords: 0, limitWords: -1 };
  }

  // Count transcript words in current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const transcriptsData = await db
    .select({ wordCount: transcripts.wordCount })
    .from(transcripts)
    .innerJoin(meetings, eq(transcripts.meetingId, meetings.id))
    .where(
      and(
        eq(meetings.userId, userId),
        gte(transcripts.createdAt, startOfMonth)
      )
    );

  const currentWords = transcriptsData.reduce((sum, t) => sum + (t.wordCount || 0), 0);

  return {
    canTranscribe: currentWords < limits.transcriptWords,
    currentWords,
    limitWords: limits.transcriptWords,
  };
}

export async function checkAgentLimit(userId: string): Promise<{
  canCreate: boolean;
  current: number;
  limit: number;
}> {
  const limits = await getUserLimits(userId);
  if (limits.agentsLimit === -1) {
    return { canCreate: true, current: 0, limit: -1 };
  }

  // Count active agents
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(db.select().from(agents).where(eq(agents.userId, userId)).as("agents"));

  const current = Number(result?.count || 0);
  return {
    canCreate: current < limits.agentsLimit,
    current,
    limit: limits.agentsLimit,
  };
}
