import type { FighterUser, PromoterUser } from '../components/UserContext';
import {
  FighterProps,
  PromoterProps,
} from '../components/ConditionalFormFields';

export type Post = {
  postId: number;
  userId: number;
  textContent: string;
  mediaUrls: string[];
  createdAt: string;
  username: string;
  profilePictureUrl: string;
};

type Profile = User | FighterUser | PromoterUser;

export type NewPost = {
  textContent: string;
  mediaUrls: string[];
};

export type Comment = {
  commentId: number;
  postId: number;
  userId: number;
  profilePictureUrl: string;
  username: string;
  text: string;
  createdAt: string;
};

export type FightHistory = {
  fightId: number;
  fighterId: number;
  date: string;
  outcome: string;
  decision: string;
  promotion: string;
  username: string;
};

export type NewFightEntry = {
  date: string;
  outcome: string;
  decision: string;
  promotion: string;
};

import { User } from '../components/UserContext';

const authKey = 'um.auth';

type Auth = {
  user: User;
  token: string;
};

export function saveAuth(user: User, token: string): void {
  const auth: Auth = { user, token };
  localStorage.setItem(authKey, JSON.stringify(auth));
}

export function removeAuth(): void {
  localStorage.removeItem(authKey);
}

export function readUser(): User | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) return undefined;
  return (JSON.parse(auth) as Auth).user;
}

export function readToken(): string | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) return undefined;
  return (JSON.parse(auth) as Auth).token;
}

export async function readComments(postId: number): Promise<Comment[]> {
  const token = readToken();
  const req = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch(`/api/posts/${postId}/comments`, req);
  if (!res.ok) throw new Error(`Failed to fetch comments for post ${postId}`);
  return (await res.json()) as Comment[];
}

export async function readPosts(): Promise<Post[]> {
  const token = readToken();
  const req = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch('/api/feed', req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return (await res.json()) as Post[];
}

export async function readPost(postId: number): Promise<Post | undefined> {
  const token = readToken();
  const req = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch(`/api/posts/${postId}`, req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return (await res.json()) as Post;
}

export async function readFight(
  fightId: number
): Promise<FightHistory | undefined> {
  const token = readToken();
  const req = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch(`/api/fights/${fightId}`, req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return (await res.json()) as FightHistory;
}

export async function readFights(): Promise<FightHistory[]> {
  const token = readToken();
  const req = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch('/api/fights', req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return (await res.json()) as FightHistory[];
}

export async function updatePost(post: Post): Promise<Post> {
  const token = readToken();
  const req = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  };
  const res = await fetch(`/api/posts/${post.postId}`, req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return (await res.json()) as Post;
}

export async function updateFight(
  fightId: number,
  fight: NewFightEntry
): Promise<FightHistory> {
  const token = readToken();
  const req = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fight),
  };
  const res = await fetch(`/api/fights/${fightId}`, req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);

  return (await res.json()) as FightHistory;
}

export async function updateProfile(
  user: FighterProps | PromoterProps
): Promise<Profile> {
  const token = readToken();
  const req = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  };
  const res = await fetch(`/api/profile/${user.userId}`, req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return (await res.json()) as Profile;
}

export async function addPost(post: NewPost): Promise<Post> {
  const token = readToken();
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  };
  const res = await fetch('/api/posts', req);
  const data = await res.json();
  console.log('server response:', data);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return data as Post;
}

export async function addFight(fight: NewFightEntry): Promise<FightHistory> {
  const token = readToken();
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fight),
  };
  const res = await fetch('/api/fights', req);
  const data = await res.json();
  console.log('server response:', data);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return data as FightHistory;
}

export async function addComment(
  postId: number,
  text: string
): Promise<Comment> {
  const token = readToken();
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  };
  const res = await fetch(`/api/posts/${postId}/comments`, req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return (await res.json()) as Comment;
}

export async function removePost(postId: number): Promise<void> {
  const token = readToken();
  const req = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch(`/api/posts/${postId}`, req);
  if (!res.ok) throw new Error(`Fetch Error ${res.status}`);
}

export async function removeFight(fightId: number): Promise<void> {
  const token = readToken();
  const req = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch(`/api/fights/${fightId}`, req);
  if (!res.ok) throw new Error(`Fetch Error ${res.status}`);
}

export async function removeComment(
  commentId: number,
  postId: number
): Promise<void> {
  const token = readToken();
  const req = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch(`api/posts/${postId}/comments/${commentId}`, req);
  if (!res.ok) throw new Error(`Fetch Error ${res.status}`);
}
