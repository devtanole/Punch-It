import { useState, useEffect } from 'react';
import { Comment } from '../lib/data';
import { readComments, addComment, removeComment } from '../lib/data';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useUser } from '../components/useUser';

type CommentProps = {
  postId: number;
};

export function Comments({ postId }: CommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<unknown>();
  const [isDeleting, setIsDeleting] = useState<{ [key: number]: boolean }>({}); // Track deletion state per comment
  const { user } = useUser();
  const userId = user?.userId;

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

  async function handleDelete(commentId: number, authorUserId: number) {
    if (authorUserId !== userId) {
      alert('You can only delete your own comments.');
      return;
    }
    try {
      await removeComment(commentId, postId);
      setComments(
        comments.filter((comment) => comment.commentId !== commentId)
      );
      setIsDeleting((prevState) => ({ ...prevState, [commentId]: false }));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  }

  const toggleDeleteConfirmation = (commentId: number) => {
    setIsDeleting((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

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
            {/* find better icon later */}
            {c.userId === userId && (
              <IconButton
                onClick={() => toggleDeleteConfirmation(c.commentId)}
                style={{ color: 'red' }}
                size="small">
                <DeleteIcon />
              </IconButton>
            )}
            {isDeleting[c.commentId] && (
              <div>
                <p>Are you sure you want to delete this comment?</p>
                <button
                  onClick={() => handleDelete(c.commentId, c.userId)}
                  style={{ color: 'red', cursor: 'pointer' }}>
                  Confirm
                </button>
                <button
                  onClick={() => toggleDeleteConfirmation(c.commentId)}
                  style={{ cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}
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
