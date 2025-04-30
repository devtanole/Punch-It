import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPencilAlt } from 'react-icons/fa';
import { Post, readPosts } from '../lib/data';
import { useUser } from '../components/useUser';
import { Comments } from './Comments';
import {
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  Divider,
  Stack,
} from '@mui/material';

export function PostFeed() {
  const [posts, setPosts] = useState<Post[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const { user } = useUser();

  useEffect(() => {
    async function load() {
      try {
        const posts = await readPosts();
        console.log('is it here:', posts);
        setPosts(posts);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    console.log(user);
    if (user) load();
  }, [user]);
  if (!user) return <div style={{ marginTop: '20px' }}>Login to continue</div>;
  if (isLoading) return <CircularProgress />;
  if (error) {
    return (
      <div>
        Error Loading Posts:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto', pt: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}>
        <Typography variant="h4">Feed</Typography>
        <Link to="/details/new">
          <Typography variant="body1" sx={{ color: 'primary.main' }}>
            Post
          </Typography>
        </Link>
      </Stack>

      {posts?.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </Box>
  );
}

type PostProps = {
  post: Post;
};

function PostCard({ post }: PostProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            alt={`${post.username}'s profile`}
            src={post.profilePictureUrl || '/images/AvatarDefault.webp'}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="h6" component="span">
              <Link
                to={`/profile/${post.userId}`}
                style={{ color: 'inherit', textDecoration: 'none' }}>
                {post.username}
              </Link>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            component={Link}
            to={`details/${post.postId}`}
            color="primary">
            <FaPencilAlt />
          </IconButton>
        </Stack>

        <Typography variant="body1" sx={{ mt: 2 }}>
          {post.textContent}
        </Typography>

        {post.mediaUrls.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {post.mediaUrls.map((url, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {url.match(/\.(mp4|mov|webm)$/i) ? (
                  <video
                    key={index}
                    src={url}
                    controls
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                ) : (
                  <img
                    key={index}
                    src={url}
                    alt={`media-${index}`}
                    style={{
                      width: '100%',
                      maxWidth: '500px',
                      borderRadius: '8px',
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>

      <Divider />
      <CardActions sx={{ p: 2 }}>
        <Comments postId={post.postId} />
      </CardActions>
    </Card>
  );
}
