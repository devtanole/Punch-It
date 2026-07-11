import type { FighterUser, PromoterUser } from '../components/UserContext';
import {
  FighterProps,
  PromoterProps,
} from '../components/ConditionalFormFields';
import { User } from '../components/UserContext';
import {
  type Post,
  type NewPost,
  type Comment,
  type FightHistory,
  type NewFightEntry,
} from './types';
import type { Follow, FollowStatus, FollowUser } from './types';
import {
  Message,
  Conversation,
  ConversationPreview,
  UnreadCount,
} from './types';

const authKey = 'um.auth';

type Auth = {
  user: User;
  token: string;
};

type Profile = User | FighterUser | PromoterUser;

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

export async function fetchFollowStatus(userId: number): Promise<FollowStatus> {
  const token = readToken();
  const res = await fetch(`/api/follows/status/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch follow status');
  return res.json() as Promise<FollowStatus>;
}

export async function followUser(userId: number): Promise<Follow> {
  const token = readToken();
  const res = await fetch(`/api/follows/${userId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to follow user');
  return res.json() as Promise<Follow>;
}

export async function unfollowUser(userId: number): Promise<void> {
  const token = readToken();
  const res = await fetch(`/api/follows/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to unfollow user');
}

export async function fetchFollowers(userId: number): Promise<FollowUser[]> {
  const token = readToken();
  const res = await fetch(`/api/follows/${userId}/followers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch followers');
  return res.json() as Promise<FollowUser[]>;
}

export async function fetchFollowing(userId: number): Promise<FollowUser[]> {
  const token = readToken();
  const res = await fetch(`/api/follows/${userId}/following`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch following');
  return res.json() as Promise<FollowUser[]>;
}

export async function fetchConversations(): Promise<ConversationPreview[]> {
  const token = readToken();
  const res = await fetch('/api/conversations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json() as Promise<ConversationPreview[]>;
}

export async function fetchMessages(
  conversationId: number
): Promise<Message[]> {
  const token = readToken();
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json() as Promise<Message[]>;
}

export async function sendMessage(
  conversationId: number,
  text: string
): Promise<Message> {
  const token = readToken();
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json() as Promise<Message>;
}

export async function startConversation(userId: number): Promise<Conversation> {
  const token = readToken();
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to start conversation');
  return res.json() as Promise<Conversation>;
}

export async function fetchUnreadCount(): Promise<UnreadCount> {
  const token = readToken();
  const res = await fetch('/api/conversations/unread', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json() as Promise<UnreadCount>;
}
