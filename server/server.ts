/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ClientError, errorMiddleware, authMiddleware } from './lib/index.js';
import { fileURLToPath } from 'url';
import path from 'path';

type Auth = {
  email: string;
  username: string;
  password: string;
};

type User = {
  userId: number;
  email: string;
  fullName: string;
  bio: string;
  username: string;
  password: string;
  userType: 'fighter' | 'promoter';
  location: string;
  profilePictureUrl: string;
};

type FighterProfile = {
  userId: number;
  height: string;
  weight: string;
  record: string;
  gymName?: string;
  pullouts: number;
  weightMisses: number;
  finishes: number;
};

type PromoterProfile = {
  userId: number;
  promotion: string;
  promoter: string;
  nextEvent?: string;
};

type Post = {
  postId: number;
  userId: number;
  textContent: string;
  mediaUrls: string[];
  createdAt: string;
};

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const hashSecret = process.env.TOKEN_SECRET;
if (!hashSecret) {
  throw new Error('TOKEN_SECRET not found in .env');
}

const app = express();

app.use(express.json());

app.post('/api/auth/sign-up', async (req, res, next) => {
  try {
    const {
      email,
      fullName,
      username,
      password,
      location,
      bio,
      profilePictureUrl,
      userType,
      ...rest
    } = req.body;
    if (
      !userType ||
      !email ||
      !fullName ||
      !username ||
      !password ||
      !location
    ) {
      throw new ClientError(400, 'a required field is missing');
    }
    const hashedPassword = await argon2.hash(password);
    const sqlUsers = `
  insert into "users" ("email", "fullName", "username", "hashedPassword", "userType", "location", "bio", "profilePictureUrl")
  values ($1, $2, $3, $4, $5, $6, $7, $8)
  returning "userId", "username", "createdAt";
  `;
    const userParams = [
      email,
      fullName,
      username,
      hashedPassword,
      userType,
      location,
      bio,
      profilePictureUrl,
    ];
    const result = await db.query(sqlUsers, userParams);
    const newUser = result.rows[0];
    const userId = newUser.userId;

    if (userType === 'fighter') {
      const {
        height,
        weight,
        record,
        gymName,
        pullouts,
        weightMisses,
        finishes,
      } = rest;
      if (
        !height ||
        !weight ||
        !record ||
        pullouts == null ||
        weightMisses == null ||
        finishes == null
      ) {
        throw new ClientError(400, 'missing required field');
      }
      const sqlFighters = `
    insert into "fighter_profile" ("userId", "height", "weight", "record", "gymName", "pullouts", "weightMisses", "finishes")
    values ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
      const fighterParams = [
        userId,
        height,
        weight,
        record,
        gymName ?? null,
        pullouts,
        weightMisses,
        finishes,
      ];

      await db.query(sqlFighters, fighterParams);
    } else if (userType === 'promoter') {
      const { promotion, promoter, nextEvent } = rest;

      if (!promotion || !promoter) {
        throw new ClientError(400, 'required field missing');
      }
      const sqlPromoter = `
    insert into "promoter_profile" ("userId", "promotion", "promoter", "nextEvent")
    values ($1, $2, $3, $4);
    `;
      const promoterParams = [userId, promotion, promoter, nextEvent ?? null];
      await db.query(sqlPromoter, promoterParams);
    } else {
      throw new ClientError(400, 'invalid user');
    }
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    const { email, username, password } = req.body as Partial<Auth>;
    if ((!email && !username) || !password) {
      throw new ClientError(401, 'invalid login, email or username missing');
    }
    const sql = `
    select "userId",
            "hashedPassword"
        from "users"
        where "email" = $1 or "username" = $2;
    `;
    const params = [email, username];
    const result = await db.query(sql, params);
    const user = result.rows[0];
    if (!user) {
      throw new ClientError(401, 'invalid login, user not found');
    }
    const isPasswordValid = await argon2.verify(user.hashedPassword, password);
    if (!isPasswordValid) {
      throw new ClientError(401, 'invalid login, invalid password');
    }
    const payload = {
      userId: user.userId,
      username: user.username,
    };
    const newSignedToken = jwt.sign(payload, hashSecret);
    res.status(200).json({
      user: payload,
      token: newSignedToken,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/fights', authMiddleware, async (req, res, next) => {
  try {
    const sql = `
      SELECT
        f."fightId",
        f."date",
        f."outcome",
        f."decision",
        f."promotion",
        u."username" AS "fighterUsername"
      FROM
        "fight_history" f
      JOIN
        "fighter_profile" fp ON f."fighterId" = fp."userId"
      JOIN
        "users" u ON fp."userId" = u."userId"
      WHERE
        f."fighterId" = $1
      ORDER BY
        f."date" DESC;
    `;
    const params = [req.user?.userId];
    const result = await db.query(sql, params);
    const history = result.rows;

    if (!history.length) {
      throw new ClientError(404, 'No fight history found');
    }

    res.json(history);
  } catch (err) {
    next(err);
  }
});

// app.get('/api/fights', authMiddleware, async (req, res, next) => {
//   try {
//     const sql = `
//       select *
//       from "fight_history"
//       where "fighterId" = $1
//       order by "date" DESC;
//     `;
//     const params = [req.user?.userId];
//     const result = await db.query(sql, params);
//     const history = result.rows;

//     if (!history.length) {
//       throw new ClientError(404, 'No fight history found');
//     }

//     res.json(history);
//   } catch (err) {
//     next(err);
//   }
// });

app.post('/api/fights', authMiddleware, async (req, res, next) => {
  try {
    const { date, outcome, decision, promotion } = req.body;
    const fighterId = req.user?.userId;

    if (!date || !outcome || !decision || !promotion) {
      throw new ClientError(400, 'All fields are required');
    }

    const sql = `
      insert into "fight_history" ("fighterId", "date", "outcome", "decision", "promotion")
      values ($1, $2, $3, $4, $5)
      returning *;
    `;
    const params = [fighterId, date, outcome, decision, promotion];
    const result = await db.query(sql, params);
    const fightRecord = result.rows[0];

    res.status(201).json(fightRecord);
  } catch (err) {
    next(err);
  }
});

app.put('/api/fights/:fightId', authMiddleware, async (req, res, next) => {
  try {
    const fightId = Number(req.params.fightId);
    if (!Number.isInteger(fightId) || fightId < 1) {
      throw new ClientError(400, 'fightId must be a positive integer');
    }

    const { date, outcome, decision, promotion } = req.body;
    const fighterId = req.user?.userId;

    if (!date || !outcome || !decision || !promotion) {
      throw new ClientError(400, 'All fields are required');
    }

    const sql = `
      update "fight_history"
      set "date" = $1,
          "outcome" = $2,
          "decision" = $3,
          "promotion" = $4
      where "fightId" = $5 and "fighterId" = $6
      returning *;
    `;
    const params = [date, outcome, decision, promotion, fightId, fighterId];
    const result = await db.query(sql, params);
    const updatedFight = result.rows[0];

    if (!updatedFight) {
      throw new ClientError(
        404,
        `No fight history found for fightId ${fightId}`
      );
    }

    res.json(updatedFight);
  } catch (err) {
    next(err);
  }
});

app.get('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const sql = `
    select * from "posts"
    where "userId" = $1
    order by "postId" desc;
    `;
    const params = [req.user?.userId];
    const result = await db.query(sql, params);
    const total = result.rows;
    if (!total) {
      throw new ClientError(404, `entries not found`);
    }
    res.json(total);
  } catch (err) {
    next(err);
  }
});

app.get('/api/feed', async (req, res, next) => {
  try {
    const sql = `
    select p.*, u."username", u."profilePictureUrl"
    from "posts" as p
    join "users" as u using ("userId")
    order by p."postId" desc;
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/profile/:userId/fights', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const sql = `
      select f."fightId", f."date", f."outcome", f."decision", f."promotion", u."username", u."profilePictureUrl"
      from "fight_history" as f
      join "users" AS u ON u."userId" = f."fighterId"

      where f."fighterId" = $1
      order by f."date" DESC;
    `;

    const result = await db.query(sql, [userId]);

    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res
        .status(404)
        .json({ message: 'No fight history found for this user.' });
    }
  } catch (err) {
    console.error('Error fetching fight history:', err);
    next(err);
  }
});

app.get('/api/profile/:userId/posts', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const sql = `
      select p.*, u."username", u."profilePictureUrl"
      from "posts" as p
      join "users" as u using ("userId")
      where p."userId" = $1
      order by p."postId" desc;
    `;

    const result = await db.query(sql, [userId]);

    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ message: 'No posts found for this user.' });
    }
  } catch (err) {
    next(err);
  }
});

app.get('/api/search', async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) {
      throw new ClientError(400, 'Username is required for search');
    }

    const sql = `
      SELECT
        u."userId",
        u."username",
        u."fullName",
        u."profilePictureUrl",
        u."bio",
        u."location",
        u."userType"
      FROM "users" u
      WHERE u."username" ILIKE $1  -- Case-insensitive search
    `;

    const params = [`%${username}%`];
    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No users found' });
    } else {
      res.json(result.rows);
    }
  } catch (err) {
    next(err);
  }
});

app.get('/api/profile/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === undefined) {
      throw new ClientError(400, `userId required`);
    }
    const sql = `
      select
        u."userId",
        u."username",
        u."fullName",
        u."bio",
        u."profilePictureUrl",
        u."location",
        u."userType",
        f."height",
        f."weight",
        f."record",
        f."gymName",
        f."pullouts",
        f."weightMisses",
        f."finishes",
        p."promotion",
        p."promoter",
        p."nextEvent"
      from "users" u
      left join "fighter_profile" f ON u."userId" = f."userId"
      left join "promoter_profile" p ON u."userId" = p."userId"
      where u."userId" = $1;
    `;
    const params = [userId];
    const result = await db.query(sql, params);
    const profile = result.rows[0];

    if (!profile) {
      throw new ClientError(404, `user ${userId} not found`);
    }
    const fullProfile = { ...profile };
    res.json(fullProfile);
  } catch (err) {
    next(err);
  }
});

app.get('/api/fights/:fightId', authMiddleware, async (req, res, next) => {
  try {
    const { fightId } = req.params;
    const userId = req.user?.userId;

    if (!fightId) {
      throw new ClientError(400, 'fightId required');
    }

    const sql = `
      select * from "fightHistory"
      where "fightId" = $1 and "userId" = $2;
    `;
    const params = [fightId, userId];
    const result = await db.query(sql, params);
    const fight = result.rows[0];

    if (!fight) {
      throw new ClientError(404, `Fight with ID ${fightId} not found`);
    }

    res.json(fight);
  } catch (err) {
    next(err);
  }
});

app.get('/api/posts/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (postId === undefined) {
      throw new ClientError(400, `postId required`);
    }
    const sql = `
    select * from "posts"
    where "postId" = $1 and "userId" = $2;
    `;
    const params = [postId, req.user?.userId];
    const result = await db.query<Post>(sql, params);
    const post = result.rows[0];
    if (!post) {
      throw new ClientError(404, `post ${postId} not found`);
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// app.post('/api/posts', authMiddleware, async (req, res, next) => {
//   try {
//     const { textContent, mediaUrls } = req.body;
//     if (!textContent && !mediaUrls) {
//       throw new ClientError(400, `post must have text or media`);
//     }
//     const sql = `
//     insert into "posts" ("textContent", "mediaUrls", "userId")
//     values ($1, $2, $3)
//     returning *;
//     `;
//     const params = [textContent, mediaUrls, req.user?.userId];
//     const result = await db.query(sql, params);
//     const post = result.rows[0];
//     res.status(201).json(post);
//   } catch (err) {
//     next(err);
//   }
// });

app.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const { textContent, mediaUrls } = req.body;
    const userId = req.user?.userId;

    if (!textContent && (!mediaUrls || mediaUrls.length === 0)) {
      throw new ClientError(400, 'Post must have text or media');
    }

    const insertSql = `
      INSERT INTO "posts" ("textContent", "mediaUrls", "userId")
      VALUES ($1, $2, $3)
      RETURNING "postId";
    `;
    const insertParams = [textContent, mediaUrls, userId];
    const insertResult = await db.query(insertSql, insertParams);
    const { postId } = insertResult.rows[0];

    const fetchSql = `
      SELECT p.*, u."username", u."profilePictureUrl"
      FROM "posts" AS p
      JOIN "users" AS u USING ("userId")
      WHERE p."postId" = $1;
    `;
    const fetchResult = await db.query(fetchSql, [postId]);
    const fullPost = fetchResult.rows[0];

    if (!fullPost) throw new ClientError(404, 'Post not found after insert');

    res.status(201).json(fullPost);
  } catch (err) {
    next(err);
  }
});

app.post(
  '/api/posts/:postId/comments',
  authMiddleware,
  async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const userId = req.user?.userId;
      const { text } = req.body;
      console.log('comment request:', {
        postId,
        userId,
        text,
      });

      if (!text || !postId || !userId) {
        throw new ClientError(400, 'Missing comment text or post ID');
      }
      const sql = `
    insert into "comments" ("postId", "userId", "text")
    values ($1, $2, $3)
    returning *;
    `;
      const params = [postId, userId, text];
      const result = await db.query(sql, params);
      const comment = result.rows[0];
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  }
);

app.get('/api/posts/:postId/comments', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
    select c.*, u."username", u."profilePictureUrl"
    from "comments" as c
    join "users" u using ("userId")
    where "postId" = $1
    order by "createdAt";
    `;
    const result = await db.query(sql, [postId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.put('/api/posts/:postId', authMiddleware, async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    if (!Number.isInteger(postId) || postId < 1) {
      throw new ClientError(400, 'postId must be a positive integer');
    }
    const { textContent, mediaUrls } = req.body;
    const sql = `
    update "posts"
    set "updatedAt" = now(),
        "textContent" = $1,
        "mediaUrls" = $2
      where "postId" = $3 and "userId" = $4
      returning *;
    `;
    const params = [textContent, mediaUrls, postId, req.user?.userId];
    const result = await db.query(sql, params);
    const updatedPost = result.rows[0];
    if (!updatedPost) {
      throw new ClientError(404, `cannot find post of post Id ${postId}`);
    }
    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
});

app.put('/api/profile/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      fullName,
      bio,
      location,
      weight,
      height,
      record,
      gymName,
      pullouts,
      weightMisses,
      finishes,
      promotion,
      promoter,
      nextEvent,
    } = req.body;
    const typeSql = `
    select "userType" from "users"
    where "userId" = $1;
    `;
    const typeResult = await db.query(typeSql, [userId]);
    const type = typeResult.rows[0]?.userType;
    console.log('type:', type);
    const FighterSql = `
    update "fighter_profile"
      set
        "weight" = $1,
        "height" = $2,
        "record" = $3,
        "gymName" = $4,
        "pullouts" = $5,
        "weightMisses" = $6,
        "finishes" = $7
      where "userId" =$8
      returning *;
    `;
    const PromoSql = `
      update "promoter_profile"
        set
        "promotion" = $1,
        "promoter" = $2,
        "nextEvent" = $3
      where "userId" = $4
      returning *;
    `;
    const userSql = `
      update "users"
        set "updatedAt" = now(),
        "bio" = $1,
        "location" = $2,
        "fullName" = $3
      where "userId" = $4
      returning "bio", "location", "fullName", "profilePictureUrl", "username", "userType";
    `;
    const fighterParams = [
      weight,
      height,
      record,
      gymName,
      pullouts,
      weightMisses,
      finishes,
      req.user?.userId,
    ];
    const promoParams = [promotion, promoter, nextEvent, req.user?.userId];
    const userParams = [bio, location, fullName, req.user?.userId];
    const userResult = await db.query(userSql, userParams);
    const updatedUser = userResult.rows[0];
    let result;
    if (type === 'fighter') {
      result = await db.query(FighterSql, fighterParams);
    } else if (type === 'promoter') {
      result = await db.query(PromoSql, promoParams);
    }
    const updatedProfile = result?.rows[0];
    updatedProfile.bio = updatedUser.bio;
    updatedProfile.location = updatedUser.location;
    updatedProfile.fullName = updatedUser.fullName;
    updatedProfile.profilePictureUrl = updatedUser.profilePictureUrl;
    updatedProfile.username = updatedUser.username;
    updatedProfile.userType = updatedUser.userType;
    if (!updatedProfile) {
      throw new ClientError(404, `cannot find user of user id ${userId}`);
    }
    res.json(updatedProfile);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/fights/:fightId', authMiddleware, async (req, res, next) => {
  try {
    const { fightId } = req.params;
    if (!Number.isInteger(+fightId)) {
      throw new ClientError(400, `Non-integer fightId: ${fightId}`);
    }

    const deleteSql = `
      delete from "fight_history"
      where "fightId" = $1 and "fighterId" = $2
      returning *;
    `;
    const params = [fightId, req.user?.userId];
    const result = await db.query(deleteSql, params);
    const [fight] = result.rows;

    if (!fight) {
      throw new ClientError(404, `fightId ${fightId} not found or not yours`);
    }

    res.status(204).json(fight);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/posts/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (!Number.isInteger(+postId)) {
      throw new ClientError(400, `Non-integer postId: ${postId}`);
    }
    const deletePostSql = `
    delete from "posts"
    where "postId" = $1 and "userId" = $2
    returning *;
    `;
    const params = [postId, req.user?.userId];
    const result = await db.query(deletePostSql, params);
    const [post] = result.rows;
    if (!post) throw new ClientError(404, `post ${postId} not found`);
    res.status(204).json(post);
  } catch (err) {
    next(err);
  }
});

app.delete(
  '/api/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { commentId, postId } = req.params;
      if (!Number.isInteger(+commentId)) {
        throw new ClientError(400, `Non-integer postId: ${commentId}`);
      }
      const sql = `
      delete from "comments"
      where "commentId" = $1 and "postId" = $2 and "userId" = $3
      returning *;
      `;
      const params = [commentId, postId, req.user?.userId];
      const result = await db.query(sql, params);
      const [comment] = result.rows;
      if (!comment)
        throw new ClientError(404, `comment ${commentId} not found`);
      res.status(204).json(comment);
    } catch (err) {
      next(err);
    }
  }
);

// Create paths for static directories

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reactStaticDir = path.resolve(__dirname, '../client/dist');
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

/*
 * Handles paths that aren't handled by any other route handler.
 * It responds with `index.html` to support page refreshes with React Router.
 * This must be the _last_ route, just before errorMiddleware.
 */
console.log('React static dir:', reactStaticDir);
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
  console.log('Punch It FullStack');
});
