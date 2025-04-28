import React, { useState, useEffect } from 'react';
import { Comment } from '../lib/data';
import { readComments, addComment } from '../lib/data';
import { Link } from 'react-router-dom';

type CommentProps = {
  postId: number;
};

export function Comments({ postId }: CommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    async function load() {
      try {
        const comments = await readComments(postId);
        setComments(comments);
      } catch (err) {
        setError(err);
      }
    }
    load();
  }, [postId]);

  if (error) {
    return (
      <div>
        Error Loading Comments:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const comment = await addComment(postId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  }

  return (
    <div className="container">
      <ul>
        {comments.map((c) => (
          <li key={c.commentId}>
            {c.profilePictureUrl ? (
              <img
                src={c.profilePictureUrl}
                alt={`${c.username}'s profile`}
                className="profile-picture"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: 12,
                }}
              />
            ) : (
              <img
                className="default-avatar"
                src="/images/AvatarDefault.webp"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: 12,
                }}
              />
            )}
            <p>
              <strong>
                <Link
                  to={`/profile/${c.userId}`}
                  style={{ color: 'black', textDecoration: 'none' }}>
                  {c.username}: {c.text}
                </Link>
              </strong>
            </p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newComment}
          placeholder="Add a comment..."
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
}
