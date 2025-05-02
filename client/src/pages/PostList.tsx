import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import EditSharpIcon from '@mui/icons-material/EditSharp';
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
  Menu,
  MenuItem,
} from '@mui/material';

export function PostFeed() {
  const [posts, setPosts] = useState<Post[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useUser();

  useEffect(() => {
    async function load() {
      try {
        const posts = await readPosts();

        setPosts(posts);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) load();
  }, [user]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
    <Stack
      direction="row"
      spacing={4}
      sx={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        pt: 4,
        px: 2,
        alignItems: 'flex-start',
      }}>
      <Box sx={{ flex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}>
          <Typography variant="h4">Feed</Typography>
          <IconButton onClick={handleMenuClick} sx={{ color: 'primary.main' }}>
            <SportsMmaIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}>
            <MenuItem
              component={Link}
              to="/details/new"
              onClick={handleMenuClose}>
              Add Post
            </MenuItem>

            <MenuItem
              component={Link}
              to="/fights/new"
              onClick={handleMenuClose}>
              Add Fight
            </MenuItem>
          </Menu>
        </Stack>

        {posts?.map((post) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </Box>
    </Stack>
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
            <EditSharpIcon />
          </IconButton>
        </Stack>

        <Typography variant="body1" sx={{ mt: 2 }}>
          {post.textContent}
        </Typography>

        {post.mediaUrls.length > 0 && (
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            {post.mediaUrls.map((url, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {url.match(/\.(mp4|mov|webm)$/i) ? (
                  <Box
                    component="video"
                    src={url}
                    controls
                    sx={{
                      width: '100%',
                      maxWidth: 400,
                      maxHeight: 300,
                      borderRadius: 2,
                      display: 'block',
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={url}
                    alt={`media-${index}`}
                    sx={{
                      width: '100%',
                      maxWidth: 400,
                      maxHeight: 300,
                      objectFit: 'cover',
                      borderRadius: 2,
                      display: 'block',
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
