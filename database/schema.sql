set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TYPE "userType" AS ENUM ('fighter', 'promoter');

CREATE TABLE "users" (
  "userId"            serial PRIMARY KEY,
  "profilePictureUrl" text,
  "email"             varchar UNIQUE NOT NULL,
  "fullName"          text NOT NULL,
  "bio"               text,
  "username"          text UNIQUE NOT NULL,
  "hashedPassword"    text NOT NULL,
  "userType"          "userType" NOT NULL,
  "location"          text NOT NULL,
  "createdAt"         timestamptz NOT NULL DEFAULT now(),
  "updatedAt"         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "fighter_profile" (
  "userId"       int PRIMARY KEY,
  "height"       text NOT NULL,
  "weight"       int NOT NULL,
  "record"       text NOT NULL,
  "weightClass"  text,
  "gymName"      text,
  "pullouts"     int NOT NULL,
  "weightMisses" int NOT NULL,
  "finishes"     int NOT NULL
);

CREATE TABLE "promoter_profile" (
  "userId"    int PRIMARY KEY,
  "promotion" text NOT NULL,
  "promoter"  text NOT NULL,
  "nextEvent" date
);

CREATE TABLE "posts" (
  "postId"      serial PRIMARY KEY,
  "userId"      int NOT NULL,
  "textContent" text NOT NULL DEFAULT '',
  "mediaUrls"   text[],
  "createdAt"   timestamptz NOT NULL DEFAULT now(),
  "updatedAt"   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "comments" (
  "commentId" serial PRIMARY KEY,
  "postId"    int NOT NULL REFERENCES "posts" ("postId") ON DELETE CASCADE,
  "userId"    int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "text"      text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "fight_history" (
  "fightId"        serial PRIMARY KEY,
  "fighterId"      int NOT NULL,
  "date"           date NOT NULL,
  "outcome"        text NOT NULL,
  "decision"       text NOT NULL,
  "promotion"      text NOT NULL,
  "opponentName"   text,
  "opponentUserId" int REFERENCES "users" ("userId") ON DELETE SET NULL,
  FOREIGN KEY ("fighterId") REFERENCES "fighter_profile" ("userId") ON DELETE CASCADE
);

CREATE TABLE "follows" (
  "followId"    serial PRIMARY KEY,
  "followerId"  int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "followingId" int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "createdAt"   timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("followerId", "followingId"),
  CHECK ("followerId" <> "followingId")
);

-- A conversation is a thread between two users
CREATE TABLE "conversations" (
  "conversationId" serial PRIMARY KEY,
  "user1Id"        int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "user2Id"        int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "createdAt"      timestamptz NOT NULL DEFAULT now(),
  "updatedAt"      timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("user1Id", "user2Id"),
  CHECK ("user1Id" < "user2Id")  -- enforces one row per pair regardless of who initiates
);

CREATE TABLE "messages" (
  "messageId"      serial PRIMARY KEY,
  "conversationId" int NOT NULL REFERENCES "conversations" ("conversationId") ON DELETE CASCADE,
  "senderId"       int NOT NULL REFERENCES "users" ("userId") ON DELETE CASCADE,
  "text"           text NOT NULL,
  "readAt"         timestamptz,  -- null means unread
  "createdAt"      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "fighter_profile" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");
ALTER TABLE "promoter_profile" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");
ALTER TABLE "posts" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

CREATE INDEX ON "users" ("username");
CREATE INDEX ON "users" ("email");
CREATE INDEX ON "posts" ("userId");
CREATE INDEX ON "fight_history" ("fighterId");
CREATE INDEX ON "comments" ("postId");
CREATE INDEX ON "follows" ("followerId");
CREATE INDEX ON "follows" ("followingId");
CREATE INDEX ON "messages" ("conversationId");
CREATE INDEX ON "messages" ("senderId");
CREATE INDEX ON "conversations" ("user1Id");
CREATE INDEX ON "conversations" ("user2Id");
