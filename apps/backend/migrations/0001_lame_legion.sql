CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"refresh_token" text NOT NULL,
	"device_info" text,
	"ip_address" varchar(45),
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_tokens" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"token" text NOT NULL,
	"provider" varchar(50) NOT NULL,
	"device_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"message_id" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "call_participants" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"call_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"joined_at" timestamp,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "calls" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"room_id" varchar(255) NOT NULL,
	"caller_id" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"recording_url" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_deletions" (
	"message_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_deletions_message_id_user_id_pk" PRIMARY KEY("message_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "message_receipts" (
	"message_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_receipts_message_id_user_id_pk" PRIMARY KEY("message_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "room_members" ADD COLUMN "last_read_message_id" varchar(255);--> statement-breakpoint
ALTER TABLE "room_members" ADD COLUMN "last_delivered_message_id" varchar(255);--> statement-breakpoint
ALTER TABLE "room_members" ADD COLUMN "is_muted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reply_to_id" varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "type" varchar(50) DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_deleted_for_everyone" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "edited_at" timestamp;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_caller_id_users_id_fk" FOREIGN KEY ("caller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_deletions" ADD CONSTRAINT "message_deletions_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_deletions" ADD CONSTRAINT "message_deletions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;