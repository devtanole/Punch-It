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

-- likes table
CREATE TABLE IF NOT EXISTS "likes" (
  "likeId"    serial PRIMARY KEY,
  "postId"    int NOT NULL REFERENCES "posts" ("postId") ON DELETE CASCADE,
  "userId"    int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("postId", "userId")
);

-- Indexes (named to avoid syntax error)
CREATE INDEX IF NOT EXISTS follows_follower_idx ON "follows" ("followerId");
CREATE INDEX IF NOT EXISTS follows_following_idx ON "follows" ("followingId");
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON "messages" ("conversationId");
CREATE INDEX IF NOT EXISTS messages_sender_idx ON "messages" ("senderId");
CREATE INDEX IF NOT EXISTS conversations_user1_idx ON "conversations" ("user1Id");
CREATE INDEX IF NOT EXISTS conversations_user2_idx ON "conversations" ("user2Id");
CREATE INDEX IF NOT EXISTS likes_post_idx ON "likes" ("postId");
CREATE INDEX IF NOT EXISTS likes_user_idx ON "likes" ("userId");
