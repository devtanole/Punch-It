set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "users" (
  "userId" serial PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "fullName" text NOT NULL,
  "bio" text NOT NULL,
  "username" text UNIQUE NOT NULL,
  "hashedPassword" text NOT NULL,
  "userType" varchar NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "location" text NOT NULL
);

CREATE TABLE "fighter_profile" (
  "userId" int PRIMARY KEY,
  "height" text,
  "weight" int,
  "record" text,
  "gymName" text,
  "pullouts" int,
  "weightMisses" int,
  "finishes" int
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
  "createdAt" timestamptz NOT NULL DEFAULT 'now()'
);

ALTER TABLE "fighter_profile" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "promoter_profile" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "posts" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

-- sd
