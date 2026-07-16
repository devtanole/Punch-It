-- Add new columns to fighter_profile
ALTER TABLE "fighter_profile" ADD COLUMN IF NOT EXISTS "weightClass" text;
ALTER TABLE "fighter_profile" ADD COLUMN IF NOT EXISTS "gymName" text;

-- Fix posts to allow media-only
ALTER TABLE "posts" ALTER COLUMN "textContent" SET DEFAULT '';
ALTER TABLE "posts" ALTER COLUMN "textContent" DROP NOT NULL;

-- Add opponent fields to fight_history
ALTER TABLE "fight_history" ADD COLUMN IF NOT EXISTS "opponentName" text;
ALTER TABLE "fight_history" ADD COLUMN IF NOT EXISTS "opponentUserId" int REFERENCES "users" ("userId") ON DELETE SET NULL;

-- follows table
CREATE TABLE IF NOT EXISTS "follows" (
  "followId"    serial PRIMARY KEY,
  "followerId"  int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "followingId" int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "createdAt"   timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("followerId", "followingId"),
  CHECK ("followerId" <> "followingId")
);

-- conversations table
CREATE TABLE IF NOT EXISTS "conversations" (
  "conversationId" serial PRIMARY KEY,
  "user1Id"        int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "user2Id"        int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "createdAt"      timestamptz NOT NULL DEFAULT now(),
  "updatedAt"      timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("user1Id", "user2Id"),
  CHECK ("user1Id" < "user2Id")
);

-- messages table
CREATE TABLE IF NOT EXISTS "messages" (
  "messageId"      serial PRIMARY KEY,
  "conversationId" int NOT NULL REFERENCES "conversations" ("conversationId") ON DELETE CASCADE,
  "senderId"       int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "text"           text NOT NULL,
  "readAt"         timestamptz,
  "createdAt"      timestamptz NOT NULL DEFAULT now()
);

-- New indexes
CREATE INDEX IF NOT EXISTS ON "follows" ("followerId");
CREATE INDEX IF NOT EXISTS ON "follows" ("followingId");
CREATE INDEX IF NOT EXISTS ON "messages" ("conversationId");
CREATE INDEX IF NOT EXISTS ON "messages" ("senderId");
CREATE INDEX IF NOT EXISTS ON "conversations" ("user1Id");
CREATE INDEX IF NOT EXISTS ON "conversations" ("user2Id");
