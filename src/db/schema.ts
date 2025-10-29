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
    // Profile & Social fields
    username: text("username").unique(), // unique handle for search/sharing
    displayName: text("display_name"), // custom display name
    avatarUrl: text("avatar_url"), // CDN URL from Uploadthing
    bio: text("bio"), // max 500 chars
    status: text("status", { enum: ["online", "dnd", "away", "offline", "invisible"] }).default("offline"),
    customStatus: text("custom_status"), // emoji + custom text
    bannerUrl: text("banner_url"), // CDN URL from Uploadthing
    richPresence: jsonb("rich_presence"), // current activity details
    badges: text("badges").array().default([]), // array of badge names (founder, beta, etc.)
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }),
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
    userUsernameIdx: index("user_username_idx").on(t.username),
    userStatusIdx: index("user_status_idx").on(t.status),
    userLastSeenIdx: index("user_last_seen_idx").on(t.lastSeenAt),
  })
);

/** AUTH_SESSION - Better Auth sessions */
export const authSession = pgTable(
  "auth_session",
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
    authSessionUserIdx: index("auth_session_user_id_idx").on(t.userId),
    authSessionTokenUq: uniqueIndex("auth_session_token_uniq").on(t.token),
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

/** AGENT */
export const agent = pgTable(
  "agent",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    description: text("description"),
    avatar: text("avatar"),
    voice: text("voice").notNull().default("alloy"),
    instructions: text("instructions").notNull(),
    provider: text("provider", { enum: ["sber", "openai"] }).notNull().default("sber"),
    model: text("model").notNull().default("GigaChat-Plus"),
    personality: jsonb("personality").$type<{
      tone?: "professional" | "casual" | "friendly" | "formal";
      expertise?: string[];
      communication_style?: string;
    }>(),
    capabilities: jsonb("capabilities").$type<{
      can_schedule?: boolean;
      can_take_notes?: boolean;
      can_record?: boolean;
      can_translate?: boolean;
      languages?: string[];
    }>(),
    isActive: boolean("is_active").$defaultFn(() => true).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    agentUserIdx: index("agent_user_id_idx").on(t.userId),
    agentActiveIdx: index("agent_active_idx").on(t.isActive),
    agentProviderIdx: index("agent_provider_idx").on(t.provider),
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

/** MEETING AGENTS - Many-to-many relationship */
export const meetingAgents = pgTable(
  "meeting_agents",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .notNull()
      .references(() => agent.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    role: text("role", { enum: ["moderator", "participant", "observer"] }).default("participant"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    leftAt: timestamp("left_at", { withTimezone: true, mode: "date" }),
  },
  (t) => ({
    meetingAgentsMeetingIdx: index("meeting_agents_meeting_id_idx").on(t.meetingId),
    meetingAgentsAgentIdx: index("meeting_agents_agent_id_idx").on(t.agentId),
    meetingAgentsActiveIdx: index("meeting_agents_active_idx").on(t.isActive),
    meetingAgentsUnique: uniqueIndex("meeting_agents_unique").on(t.meetingId, t.agentId),
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

/** MEETING CHAT MESSAGES */
export const meetingChatMessages = pgTable(
  "meeting_chat_messages",
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
    meetingMessagesMeetingIdx: index("meeting_messages_meeting_id_idx").on(t.meetingId),
    meetingMessagesUserIdx: index("meeting_messages_user_id_idx").on(t.userId),
    meetingMessagesTimestampIdx: index("meeting_messages_timestamp_idx").on(t.timestamp),
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

/** SESSIONS - Zoom-like session management */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    code: text("code").notNull().unique(), // 9-11 char join code
    type: text("type", { enum: ["chat", "call", "meeting"] }).notNull(),
    hostUserId: text("host_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["active", "ended", "expired"] })
      .notNull()
      .default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sessionsCodeIdx: index("sessions_code_idx").on(t.code),
    sessionsHostIdx: index("sessions_host_user_id_idx").on(t.hostUserId),
    sessionsStatusIdx: index("sessions_status_idx").on(t.status),
    sessionsTypeIdx: index("sessions_type_idx").on(t.type),
  })
);

/** SESSION PARTICIPANTS - Users and agents in sessions */
export const sessionParticipants = pgTable(
  "session_participants",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .references(() => agent.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["host", "cohost", "participant"] })
      .notNull()
      .default("participant"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    leftAt: timestamp("left_at", { withTimezone: true, mode: "date" }),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (t) => ({
    sessionParticipantsSessionIdx: index("session_participants_session_id_idx").on(t.sessionId),
    sessionParticipantsUserIdx: index("session_participants_user_id_idx").on(t.userId),
    sessionParticipantsAgentIdx: index("session_participants_agent_id_idx").on(t.agentId),
    sessionParticipantsActiveIdx: index("session_participants_active_idx").on(t.isActive),
    sessionParticipantsUnique: uniqueIndex("session_participants_unique").on(t.sessionId, t.userId, t.agentId),
  })
);

/** SESSION MESSAGES - Chat messages in sessions */
export const sessionMessages = pgTable(
  "session_messages",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    senderUserId: text("sender_user_id")
      .references(() => user.id, { onDelete: "cascade" }),
    senderAgentId: text("sender_agent_id")
      .references(() => agent.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    type: text("type", { enum: ["text", "system"] })
      .notNull()
      .default("text"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sessionMessagesSessionIdx: index("session_messages_session_id_idx").on(t.sessionId),
    sessionMessagesSenderUserIdx: index("session_messages_sender_user_id_idx").on(t.senderUserId),
    sessionMessagesSenderAgentIdx: index("session_messages_sender_agent_id_idx").on(t.senderAgentId),
    sessionMessagesCreatedAtIdx: index("session_messages_created_at_idx").on(t.createdAt),
  })
);

/** MEETING SESSIONS - Link meetings to sessions */
export const meetingSessions = pgTable(
  "meeting_sessions",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    meetingSessionsMeetingIdx: index("meeting_sessions_meeting_id_idx").on(t.meetingId),
    meetingSessionsSessionIdx: index("meeting_sessions_session_id_idx").on(t.sessionId),
    meetingSessionsUnique: uniqueIndex("meeting_sessions_unique").on(t.meetingId, t.sessionId),
  })
);

/** FRIENDSHIPS - Friend relationships between users */
export const friendships = pgTable(
  "friendships",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["pending", "accepted", "rejected", "blocked"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    friendshipsSenderIdx: index("friendships_sender_id_idx").on(t.senderId),
    friendshipsReceiverIdx: index("friendships_receiver_id_idx").on(t.receiverId),
    friendshipsStatusIdx: index("friendships_status_idx").on(t.status),
    friendshipsUnique: uniqueIndex("friendships_unique").on(t.senderId, t.receiverId),
  })
);

/** NOTIFICATIONS - User notifications */
export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", { 
      enum: [
        "friend_request", "friend_accepted", "friend_removed", 
        "blocked_by_other", "unblocked_by_other",
        "meeting_invite", "meeting_started", "meeting_cancelled",
        "friend_online"
      ] 
    }).notNull(),
    fromUserId: text("from_user_id")
      .references(() => user.id, { onDelete: "cascade" }),
    metadata: jsonb("metadata"), // additional data (meetingId, etc.)
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    notificationsUserIdx: index("notifications_user_id_idx").on(t.userId),
    notificationsFromUserIdx: index("notifications_from_user_id_idx").on(t.fromUserId),
    notificationsTypeIdx: index("notifications_type_idx").on(t.type),
    notificationsUnreadIdx: index("notifications_unread_idx").on(t.isRead),
    notificationsCreatedAtIdx: index("notifications_created_at_idx").on(t.createdAt),
  })
);

/** CHAT - Direct chats between users and agents */
export const chat = pgTable(
  "chat",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .references(() => agent.id, { onDelete: "cascade" }),
    participantId: text("participant_id")
      .references(() => user.id, { onDelete: "cascade" }),
    chatType: text("chat_type", { enum: ["agent", "user"] })
      .notNull()
      .default("agent"),
    title: text("title").notNull(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    chatUserIdx: index("chat_user_id_idx").on(t.userId),
    chatAgentIdx: index("chat_agent_id_idx").on(t.agentId),
    chatParticipantIdx: index("chat_participant_id_idx").on(t.participantId),
    chatLastMessageIdx: index("chat_last_message_at_idx").on(t.lastMessageAt),
    chatUserAgentUnique: uniqueIndex("chat_user_id_agent_id_uniq").on(t.userId, t.agentId),
    chatUserParticipantUnique: uniqueIndex("chat_user_id_participant_id_uniq").on(t.userId, t.participantId),
  })
);

/** CHAT_MESSAGE - Messages in chats */
export const chatMessage = pgTable(
  "chat_message",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    chatId: text("chat_id")
      .notNull()
      .references(() => chat.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    messageType: text("message_type", { enum: ["text", "image", "file", "system"] })
      .notNull()
      .default("text"),
    metadata: jsonb("metadata").$type<{
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      imageUrl?: string;
      imageWidth?: number;
      imageHeight?: number;
    }>(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    chatMessageChatIdx: index("chat_message_chat_id_idx").on(t.chatId),
    chatMessageSenderIdx: index("chat_message_sender_id_idx").on(t.senderId),
    chatMessageCreatedAtIdx: index("chat_message_created_at_idx").on(t.createdAt),
  })
);
