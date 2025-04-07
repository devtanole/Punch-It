/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ClientError, errorMiddleware } from './lib/index.js';

type User = {
  userId: number;
  email: string;
  fullName: string;
  bio: string;
  username: string;
  password: string;
  userType: 'fighter' | 'promoter';
  location: string;
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

const hashkey = process.env.TOKEN_SECRET as string;
if (!hashkey) {
  throw new Error('TOKEN_SECRET not found in .env');
}

const app = express();

app.use(express.json());

app.post('/api/users/sign-up', async (req, res, next) => {
  try {
    const { email, fullName, username, password, userType, location, bio } =
      req.body;
    if (
      !email ||
      !fullName ||
      !username ||
      !password ||
      !userType ||
      !location ||
      !bio
    ) {
      throw new ClientError(400, 'a required field is missing');
    }
    const sqlCheck = `select * from "users"
    where "email" = $1 or "username" = $2;
    `;
    const checkResult = await db.query(sqlCheck, [email, username]);
    if (checkResult.rows.length > 0) {
      const existingUser = checkResult.rows[0];

      if (existingUser.email === email) {
        throw new ClientError(400, 'email already in use.');
      }

      if (existingUser.username === username) {
        throw new ClientError(400, 'username is taken.');
      }
    }
    const hashedPassword = await argon2.hash(password);

    const newUserSQL = `
  insert into "users" ("email", "fullName", "username", "hashedPassword", "userType", "location", "bio")
  values ($1, $2, $3, $4, $5, $6, $7)
  returning "userId", "fullName", "username", "createdAt";
  `;
    const params = [
      email,
      fullName,
      username,
      hashedPassword,
      userType,
      location,
      bio,
    ];
    const result = await db.query(newUserSQL, params);
    const newUser = result.rows[0];
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

app.post('/api/users/sign-in', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      throw new ClientError(401, 'invalid login');
    }
    const sql = `
    select "userId",
            "hashedPassword"
        from "users"
        where "email" = $1 or "username" = $2;
    `;
    const params = [username, email];
    const result = await db.query(sql, params);
    const user = result.rows[0];
    if (!user) {
      throw new ClientError(401, 'invalid login');
    }
    const isPasswordValid = await argon2.verify(user.hashedPassword, password);
    if (!isPasswordValid) {
      throw new ClientError(401, 'invalid login');
    }
    const payload = {
      userId: user.userId,
      username: user.username,
    };
    const newSignedToken = jwt.sign(payload, hashkey);
    res.status(200).json({
      user: payload,
      token: newSignedToken,
    });
  } catch (err) {
    next(err);
  }
});

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
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
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
  console.log('Punch It FullStack');
});
