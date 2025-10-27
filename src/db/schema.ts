import { nanoid } from "nanoid";
import {
  pgTable, text, timestamp, boolean,
  index, uniqueIndex, integer, jsonb, decimal
} from "drizzle-orm/pg-core";

/** USER */
export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").$defaultFn(() => false).notNull(),
    image: text("image"),
    // DB-сторона, тип Date в TS
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("user_email_uniq").on(t.email),
  })
);

/** SESSION */
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => ({
    sessionUserIdx: index("session_user_id_idx").on(t.userId),
    sessionTokenUq: uniqueIndex("session_token_uniq").on(t.token),
  })
);

/** ACCOUNT */
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: "date" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    // Обычный инвариант OAuth: один внешний аккаунт единственен по (providerId, accountId)
    providerAccountUq: uniqueIndex("account_provider_account_uniq").on(t.providerId, t.accountId),
    accountUserIdx: index("account_user_id_idx").on(t.userId),
  })
);

/** VERIFICATION */
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    // Обычно код/токен в связке с идентификатором должен быть уникален
    verificationUnique: uniqueIndex("verification_identifier_value_uniq").on(t.identifier, t.value),
    verificationExpiryIdx: index("verification_expires_at_idx").on(t.expiresAt),
  })
);

/** AGENTS */
export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    instructions: text("instructions").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    agentsUserIdx: index("agents_user_id_idx").on(t.userId),
    agentsUserNameUq: uniqueIndex("agents_user_id_name_uniq").on(t.userId, t.name),
  })
);

/** MEETINGS */
export const meetings = pgTable(
  "meetings",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    title: text("title").notNull(),
    description: text("description"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .references(() => agents.id, { onDelete: "set null" }),
    status: text("status", { enum: ["scheduled", "active", "completed", "cancelled"] })
      .notNull()
      .default("scheduled"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: "date" }),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "date" }),
    duration: integer("duration"), // в секундах
    streamCallId: text("stream_call_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    meetingsUserIdx: index("meetings_user_id_idx").on(t.userId),
    meetingsAgentIdx: index("meetings_agent_id_idx").on(t.agentId),
    meetingsStatusIdx: index("meetings_status_idx").on(t.status),
    meetingsScheduledIdx: index("meetings_scheduled_at_idx").on(t.scheduledAt),
  })
);

/** MEETING PARTICIPANTS */
export const meetingParticipants = pgTable(
  "meeting_participants",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["host", "guest"] }).notNull().default("guest"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" }),
    leftAt: timestamp("left_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    participantsMeetingIdx: index("participants_meeting_id_idx").on(t.meetingId),
    participantsUserIdx: index("participants_user_id_idx").on(t.userId),
  })
);

/** RECORDINGS */
export const recordings = pgTable(
  "recordings",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"), // в байтах
    duration: integer("duration"), // в секундах
    format: text("format").notNull(), // mp4, webm, etc
    status: text("status", { enum: ["processing", "ready", "failed"] })
      .notNull()
      .default("processing"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    recordingsMeetingIdx: index("recordings_meeting_id_idx").on(t.meetingId),
    recordingsStatusIdx: index("recordings_status_idx").on(t.status),
  })
);

/** TRANSCRIPTS */
export const transcripts = pgTable(
  "transcripts",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    language: text("language").notNull().default("ru"),
    wordCount: integer("word_count"),
    status: text("status", { enum: ["processing", "ready", "failed"] })
      .notNull()
      .default("processing"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    transcriptsMeetingIdx: index("transcripts_meeting_id_idx").on(t.meetingId),
    transcriptsStatusIdx: index("transcripts_status_idx").on(t.status),
  })
);

/** TRANSCRIPT SUMMARIES */
export const transcriptSummaries = pgTable(
  "transcript_summaries",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    transcriptId: text("transcript_id")
      .notNull()
      .references(() => transcripts.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    keyPoints: jsonb("key_points"),
    actionItems: jsonb("action_items"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    summariesTranscriptIdx: index("summaries_transcript_id_idx").on(t.transcriptId),
  })
);

/** CHAT MESSAGES */
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    messageType: text("message_type", { enum: ["text", "system", "ai"] })
      .notNull()
      .default("text"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    messagesMeetingIdx: index("messages_meeting_id_idx").on(t.meetingId),
    messagesUserIdx: index("messages_user_id_idx").on(t.userId),
    messagesTimestampIdx: index("messages_timestamp_idx").on(t.timestamp),
  })
);

/** SUBSCRIPTIONS */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    polarSubscriptionId: text("polar_subscription_id").unique(),
    plan: text("plan", { enum: ["free", "pro", "enterprise"] })
      .notNull()
      .default("free"),
    status: text("status", { enum: ["active", "cancelled", "expired"] })
      .notNull()
      .default("active"),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true, mode: "date" }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    subscriptionsUserIdx: index("subscriptions_user_id_idx").on(t.userId),
    subscriptionsStatusIdx: index("subscriptions_status_idx").on(t.status),
  })
);

/** PAYMENTS */
export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subscriptionId: text("subscription_id")
      .references(() => subscriptions.id, { onDelete: "set null" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    status: text("status", { enum: ["pending", "completed", "failed", "refunded"] })
      .notNull()
      .default("pending"),
    polarPaymentId: text("polar_payment_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    paymentsUserIdx: index("payments_user_id_idx").on(t.userId),
    paymentsSubscriptionIdx: index("payments_subscription_id_idx").on(t.subscriptionId),
    paymentsStatusIdx: index("payments_status_idx").on(t.status),
  })
);

/** USAGE METRICS */
export const usageMetrics = pgTable(
  "usage_metrics",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id")
      .references(() => meetings.id, { onDelete: "set null" }),
    duration: integer("duration"), // в секундах
    storageUsed: integer("storage_used"), // в байтах
    transcriptWords: integer("transcript_words"),
    date: timestamp("date", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    metricsUserIdx: index("metrics_user_id_idx").on(t.userId),
    metricsDateIdx: index("metrics_date_idx").on(t.date),
  })
);
