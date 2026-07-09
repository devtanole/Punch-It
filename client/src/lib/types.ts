export type Post = {
  postId: number;
  userId: number;
  textContent: string;
  mediaUrls: string[];
  createdAt: string;
  username: string;
  profilePictureUrl: string;
};

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

export type FollowStatus = {
  isFollowing: boolean;
};

export type Follow = {
  followId: number;
  followerId: number;
  followingId: number;
  createdAt: string;
};

export type FollowUser = {
  userId: number;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
  userType: 'fighter' | 'promoter';
};

export type Conversation = {
  conversationId: number;
  user1Id: number;
  user2Id: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationPreview = {
  conversationId: number;
  updatedAt: string;
  otherUserId: number;
  otherUsername: string;
  otherFullName: string;
  otherProfilePictureUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type Message = {
  messageId: number;
  conversationId: number;
  senderId: number;
  text: string;
  readAt: string | null;
  createdAt: string;
  username: string;
  profilePictureUrl: string | null;
};

export type UnreadCount = {
  unreadCount: number;
};
