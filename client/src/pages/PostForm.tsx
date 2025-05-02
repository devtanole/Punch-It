import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  type Post,
  type NewPost,
  addPost,
  readPost,
  removePost,
  updatePost,
} from '../lib/data';
import { MediaUploads } from '../components/MediaUploads';
import {
  CircularProgress,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';

const MAX_MEDIA = 4;

export function PostForm() {
  const { postId } = useParams();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [textContent, setTextContent] = useState('');
  const [post, setPost] = useState<Post>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const isEditing = postId && postId !== 'new';

  useEffect(() => {
    async function load(id: number) {
      setIsLoading(true);
      try {
        const post = await readPost(id);
        if (!post) throw new Error(`Post with ID ${id} not found`);
        setPost(post);
        setMediaUrls(post?.mediaUrls);
        setTextContent(post.textContent);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (isEditing) load(+postId);
  }, [postId, isEditing]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawText = formData.get('textContent');
    const textContent =
      (typeof rawText === 'string' ? rawText.trim() : '') ?? '';

    if (!textContent && mediaUrls.length === 0) {
      alert('Post must have either text or media');
      return;
    }

    const newPost: NewPost = { textContent: textContent.trim(), mediaUrls };

    try {
      if (isEditing && post) {
        await updatePost({ ...post, ...newPost });
      } else {
        const createdPost = await addPost(newPost);
        alert(
          `Successfully posted ${createdPost.postId} from userId ${createdPost.userId}.`
        );
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      alert(`Error saving post: ${String(err)}`);
    }
  }

  async function handleDelete() {
    if (!post?.postId) throw new Error('Should never happen');
    try {
      setIsDeleting(true);
      await removePost(post.postId);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(`Error deleting post:` + String(err));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <CircularProgress />;
  if (error) {
    return (
      <Alert severity="error">
        Error Loading Post with ID {postId}:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </Alert>
    );
  }

  return (
    <Box maxWidth={600} mx="auto" p={2}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Post' : 'New Post'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            name="textContent"
            label="Text Content"
            multiline
            rows={6}
            fullWidth
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />

          {mediaUrls.length < MAX_MEDIA && (
            <MediaUploads
              onUpload={(url) => setMediaUrls((prev) => [...prev, url])}
              disabled={mediaUrls.length >= MAX_MEDIA}
            />
          )}
          {mediaUrls.length >= MAX_MEDIA && (
            <Typography color="text.secondary">
              You can upload a maximum of 4 media files.
            </Typography>
          )}

          {mediaUrls.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={2}>
              {mediaUrls.map((url, index) => (
                <Box key={index} sx={{ position: 'relative', width: 180 }}>
                  {url.endsWith('.mp4') || url.endsWith('.webm') ? (
                    <Box
                      component="video"
                      src={url}
                      controls
                      sx={{ width: '100%', borderRadius: 1 }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={url}
                      alt={`media-${index}`}
                      sx={{
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                        borderRadius: 1,
                        boxShadow: 1,
                      }}
                    />
                  )}
                  <Button
                    onClick={() =>
                      setMediaUrls((prev) => prev.filter((_, i) => i !== index))
                    }
                    size="small"
                    color="error"
                    sx={{ mt: 1 }}>
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between">
            {isEditing && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setIsDeleting(true)}>
                Delete Post
              </Button>
            )}
            <Button type="submit" variant="contained">
              {isEditing ? 'Update Post' : 'Post'}
            </Button>
          </Stack>
        </Stack>
      </form>

      {/* Deletion Confirmation Dialog */}
      <Dialog open={isDeleting} onClose={() => setIsDeleting(false)}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this post?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleting(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
