import express from 'express';
import pg from 'pg';
import { ClientError, authMiddleware } from '../lib/index.js';

export function followsRouter(db: pg.Pool): any {
  const router = express.Router();

  // Follow a user
  router.post('/:userId', authMiddleware, async (req, res, next) => {
    try {
      const followerId = req.user?.userId;
      const followingId = Number(req.params.userId);

      if (!Number.isInteger(followingId) || followingId < 1) {
        throw new ClientError(400, 'invalid userId');
      }
      if (followerId === followingId) {
        throw new ClientError(400, 'cannot follow yourself');
      }

      const result = await db.query(
        `insert into "follows" ("followerId", "followingId")
         values ($1, $2)
         on conflict do nothing
         returning *`,
        [followerId, followingId]
      );

      if (!result.rows[0]) {
        return res.status(200).json({ message: 'already following' });
      }

      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Unfollow a user
  router.delete('/:userId', authMiddleware, async (req, res, next) => {
    try {
      const followerId = req.user?.userId;
      const followingId = Number(req.params.userId);

      if (!Number.isInteger(followingId) || followingId < 1) {
        throw new ClientError(400, 'invalid userId');
      }

      await db.query(
        `delete from "follows"
         where "followerId" = $1 and "followingId" = $2`,
        [followerId, followingId]
      );

      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });

  // Check if the current user follows a specific user
  router.get('/status/:userId', authMiddleware, async (req, res, next) => {
    try {
      const followerId = req.user?.userId;
      const followingId = Number(req.params.userId);

      const result = await db.query(
        `select 1 from "follows"
         where "followerId" = $1 and "followingId" = $2`,
        [followerId, followingId]
      );

      res.json({ isFollowing: result.rows.length > 0 });
    } catch (err) {
      next(err);
    }
  });

  // Get all followers of a user
  router.get('/:userId/followers', async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await db.query(
        `select u."userId", u."username", u."fullName", u."profilePictureUrl", u."userType"
         from "follows" f
         join "users" u on u."userId" = f."followerId"
         where f."followingId" = $1
         order by f."createdAt" desc`,
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get all users a user is following
  router.get('/:userId/following', async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await db.query(
        `select u."userId", u."username", u."fullName", u."profilePictureUrl", u."userType"
         from "follows" f
         join "users" u on u."userId" = f."followingId"
         where f."followerId" = $1
         order by f."createdAt" desc`,
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
