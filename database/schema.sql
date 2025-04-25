set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "users" (
  "userId" serial PRIMARY KEY,
  "profilePictureUrl" text,
  "email" varchar UNIQUE NOT NULL,
  "fullName" text NOT NULL,
  "bio" text,
  "username" text UNIQUE NOT NULL,
  "hashedPassword" text NOT NULL,
  "userType" varchar NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT 'now()',
  "location" text NOT NULL
);

CREATE TABLE "fighter_profile" (
  "userId" int PRIMARY KEY,
  "height" text NOT NULL,
  "weight" int NOT NULL,
  "record" text NOT NULL,
  "gymName" text,
  "pullouts" int NOT NULL,
  "weightMisses" int NOT NULL,
  "finishes" int NOT NULL
);

CREATE TABLE "promoter_profile" (
  "userId" int PRIMARY KEY,
  "promotion" text NOT NULL,
  "promoter" text NOT NULL,
  "nextEvent" timestamptz
);

CREATE TABLE "posts" (
  "postId" serial PRIMARY KEY,
  "userId" int,
  "textContent" text NOT NULL,
  "mediaUrls" text[],
  "createdAt" timestamptz NOT NULL DEFAULT 'now()',
  "updatedAt"      timestamptz not null default 'now()'

);

CREATE TABLE "comments" (
  "commentId" serial PRIMARY KEY,
  "postId" integer not null references "posts"("postId") on delete cascade,
  "userId" integer not null references "users"("userId") on delete cascade,
  "text" text not null,
  "createdAt" timestamptz not null default now()
);

ALTER TABLE "fighter_profile" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "promoter_profile" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "posts" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

-- sd
