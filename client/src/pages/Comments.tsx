import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../lib/types';
import { readComments, addComment, removeComment } from '../lib/data';
import { useUser } from '../components/useUser';
import {
  Box,
  Stack,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import SendIcon from '@mui/icons-material/Send';

type CommentProps = {
  postId: number;
};

export function Comments({ postId }: CommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const { user } = useUser();

  useEffect(() => {
    async function load() {
      try {
        const data = await readComments(postId);
        setComments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load comments'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const added = await addComment(postId, newComment.trim());
      setComments((prev) => [...prev, added]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await removeComment(deleteTarget, postId);
      setComments((prev) => prev.filter((c) => c.commentId !== deleteTarget));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Comment list */}
      {loading ? (
        <Stack spacing={2} mb={2}>
          {[1, 2].map((i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={28} height={28} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={100} height={16} />
                <Skeleton variant="text" width="80%" height={16} />
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
          No comments yet. Be the first.
        </Typography>
      ) : (
        <Stack spacing={2} mb={2}>
          {comments.map((c) => (
            <Box key={c.commentId}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Avatar
                  src={c.profilePictureUrl || '/images/AvatarDefault.webp'}
                  alt={c.username}
                  sx={{ width: 28, height: 28 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="baseline">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      component={Link}
                      to={`/profile/${c.userId}`}
                      sx={{
                        color: 'text.primary',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}>
                      {c.username}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {c.text}
                  </Typography>
                </Box>
                {c.userId === user?.userId && (
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget(c.commentId)}
                    sx={{
                      color: 'text.disabled',
                      '&:hover': { color: 'error.main' },
                    }}>
                    <DeleteSharpIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Input */}
      {user && (
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <Avatar
            src={user.profilePictureUrl || '/images/AvatarDefault.webp'}
            sx={{ width: 28, height: 28 }}
          />
          <TextField
            fullWidth
            size="small"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={3}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <IconButton
            color="primary"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            sx={{ mb: 0.5 }}>
            <SendIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this comment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
