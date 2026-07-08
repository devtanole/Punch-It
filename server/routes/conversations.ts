import express from 'express';
import pg from 'pg';
import { ClientError, authMiddleware } from '../lib/index.js';

export function conversationsRouter(db: pg.Pool): any {
  const router = express.Router();

  // Get or create a conversation between current user and another user
  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const currentUserId = req.user?.userId as number;
      const otherUserId = Number(req.body.userId);

      if (!Number.isInteger(otherUserId) || otherUserId < 1) {
        throw new ClientError(400, 'invalid userId');
      }
      if (currentUserId === otherUserId) {
        throw new ClientError(400, 'cannot message yourself');
      }

      // Enforce user1Id < user2Id to match the CHECK constraint
      const user1Id = Math.min(currentUserId, otherUserId);
      const user2Id = Math.max(currentUserId, otherUserId);

      const result = await db.query(
        `insert into "conversations" ("user1Id", "user2Id")
         values ($1, $2)
         on conflict ("user1Id", "user2Id") do update
           set "updatedAt" = now()
         returning *`,
        [user1Id, user2Id]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Get all conversations for the current user, most recent first
  router.get('/', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user?.userId;

      const result = await db.query(
        `select
           c."conversationId",
           c."updatedAt",
           -- The "other" user in the conversation
           other."userId"            as "otherUserId",
           other."username"          as "otherUsername",
           other."fullName"          as "otherFullName",
           other."profilePictureUrl" as "otherProfilePictureUrl",
           -- Most recent message preview
           last_msg."text"           as "lastMessage",
           last_msg."createdAt"      as "lastMessageAt",
           -- Unread count for current user
           (
             select count(*) from "messages" m
             where m."conversationId" = c."conversationId"
               and m."senderId" <> $1
               and m."readAt" is null
           ) as "unreadCount"
         from "conversations" c
         join "users" other on other."userId" = case
           when c."user1Id" = $1 then c."user2Id"
           else c."user1Id"
         end
         left join lateral (
           select "text", "createdAt"
           from "messages"
           where "conversationId" = c."conversationId"
           order by "createdAt" desc
           limit 1
         ) last_msg on true
         where c."user1Id" = $1 or c."user2Id" = $1
         order by c."updatedAt" desc`,
        [userId]
      );

      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get all messages in a conversation
  router.get(
    '/:conversationId/messages',
    authMiddleware,
    async (req, res, next) => {
      try {
        const userId = req.user?.userId;
        const { conversationId } = req.params;

        // Verify the requesting user is actually part of this conversation
        const access = await db.query(
          `select 1 from "conversations"
         where "conversationId" = $1
           and ("user1Id" = $2 or "user2Id" = $2)`,
          [conversationId, userId]
        );
        if (!access.rows.length) {
          throw new ClientError(403, 'access denied');
        }

        // Mark all messages from the other user as read
        await db.query(
          `update "messages"
         set "readAt" = now()
         where "conversationId" = $1
           and "senderId" <> $2
           and "readAt" is null`,
          [conversationId, userId]
        );

        const result = await db.query(
          `select m.*, u."username", u."profilePictureUrl"
         from "messages" m
         join "users" u on u."userId" = m."senderId"
         where m."conversationId" = $1
         order by m."createdAt" asc`,
          [conversationId]
        );

        res.json(result.rows);
      } catch (err) {
        next(err);
      }
    }
  );

  // Send a message
  router.post(
    '/:conversationId/messages',
    authMiddleware,
    async (req, res, next) => {
      try {
        const userId = req.user?.userId;
        const { conversationId } = req.params;
        const { text } = req.body;

        if (!text?.trim()) {
          throw new ClientError(400, 'message text required');
        }

        // Verify access
        const access = await db.query(
          `select 1 from "conversations"
         where "conversationId" = $1
           and ("user1Id" = $2 or "user2Id" = $2)`,
          [conversationId, userId]
        );
        if (!access.rows.length) {
          throw new ClientError(403, 'access denied');
        }

        const result = await db.query(
          `insert into "messages" ("conversationId", "senderId", "text")
         values ($1, $2, $3)
         returning *`,
          [conversationId, userId, text]
        );

        // Bump conversation updatedAt so it surfaces at top of inbox
        await db.query(
          `update "conversations" set "updatedAt" = now()
         where "conversationId" = $1`,
          [conversationId]
        );

        res.status(201).json(result.rows[0]);
      } catch (err) {
        next(err);
      }
    }
  );

  // Get total unread count across all conversations (for nav badge)
  router.get('/unread', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user?.userId;

      const result = await db.query(
        `select count(*) as "unreadCount"
         from "messages" m
         join "conversations" c on c."conversationId" = m."conversationId"
         where (c."user1Id" = $1 or c."user2Id" = $1)
           and m."senderId" <> $1
           and m."readAt" is null`,
        [userId]
      );

      res.json({ unreadCount: Number(result.rows[0].unreadCount) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
