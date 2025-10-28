CREATE TABLE "agent" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar" text,
	"voice" text DEFAULT 'alloy' NOT NULL,
	"instructions" text NOT NULL,
	"provider" text DEFAULT 'sber' NOT NULL,
	"model" text DEFAULT 'GigaChat:latest' NOT NULL,
	"personality" jsonb,
	"capabilities" jsonb,
	"is_active" boolean NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_agents" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"role" text DEFAULT 'participant',
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "meeting_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"from_user_id" text,
	"metadata" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"sender_user_id" text,
	"sender_agent_id" text,
	"content" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"agent_id" text,
	"role" text DEFAULT 'participant' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"host_user_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "meetings" DROP CONSTRAINT "meetings_agent_id_agents_id_fk";
--> statement-breakpoint
DROP INDEX "meetings_agent_id_idx";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "status" text DEFAULT 'offline';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "custom_status" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "rich_presence" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "badges" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent" ADD CONSTRAINT "agent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_agents" ADD CONSTRAINT "meeting_agents_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_agents" ADD CONSTRAINT "meeting_agents_agent_id_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_sessions" ADD CONSTRAINT "meeting_sessions_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_sessions" ADD CONSTRAINT "meeting_sessions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_messages" ADD CONSTRAINT "session_messages_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_messages" ADD CONSTRAINT "session_messages_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_messages" ADD CONSTRAINT "session_messages_sender_agent_id_agent_id_fk" FOREIGN KEY ("sender_agent_id") REFERENCES "public"."agent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_agent_id_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_host_user_id_user_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_user_id_idx" ON "agent" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agent_active_idx" ON "agent" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "agent_provider_idx" ON "agent" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "friendships_sender_id_idx" ON "friendships" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "friendships_receiver_id_idx" ON "friendships" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "friendships_status_idx" ON "friendships" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "friendships_unique" ON "friendships" USING btree ("sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX "meeting_agents_meeting_id_idx" ON "meeting_agents" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "meeting_agents_agent_id_idx" ON "meeting_agents" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "meeting_agents_active_idx" ON "meeting_agents" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "meeting_agents_unique" ON "meeting_agents" USING btree ("meeting_id","agent_id");--> statement-breakpoint
CREATE INDEX "meeting_sessions_meeting_id_idx" ON "meeting_sessions" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "meeting_sessions_session_id_idx" ON "meeting_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meeting_sessions_unique" ON "meeting_sessions" USING btree ("meeting_id","session_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_from_user_id_idx" ON "notifications" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_unread_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_messages_session_id_idx" ON "session_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_messages_sender_user_id_idx" ON "session_messages" USING btree ("sender_user_id");--> statement-breakpoint
CREATE INDEX "session_messages_sender_agent_id_idx" ON "session_messages" USING btree ("sender_agent_id");--> statement-breakpoint
CREATE INDEX "session_messages_created_at_idx" ON "session_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_participants_session_id_idx" ON "session_participants" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_participants_user_id_idx" ON "session_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_participants_agent_id_idx" ON "session_participants" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "session_participants_active_idx" ON "session_participants" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "session_participants_unique" ON "session_participants" USING btree ("session_id","user_id","agent_id");--> statement-breakpoint
CREATE INDEX "sessions_code_idx" ON "sessions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "sessions_host_user_id_idx" ON "sessions" USING btree ("host_user_id");--> statement-breakpoint
CREATE INDEX "sessions_status_idx" ON "sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_type_idx" ON "sessions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "user_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
CREATE INDEX "user_status_idx" ON "user" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_last_seen_idx" ON "user" USING btree ("last_seen_at");--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "agent_id";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");