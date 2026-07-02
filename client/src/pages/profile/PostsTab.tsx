import { Paper, Avatar, Stack, Typography, Box } from '@mui/material';
import { Post } from '../../lib/data';

type Props = {
  posts: Post[];
};

export function PostsTab({ posts }: Props) {
  if (!posts.length) {
    return <Typography color="text.secondary">No posts yet.</Typography>;
  }

  return (
    <>
      {posts.map((post) => (
        <Paper key={post.postId} sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar
              src={post.profilePictureUrl || '/images/Avatar-Default.webp'}
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography fontWeight="bold">{post.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Stack>

          <Typography>{post.textContent}</Typography>

          {post.mediaUrls.length > 0 && (
            <Box mt={2}>
              {post.mediaUrls.map((url, i) => (
                <Box key={i} mb={2}>
                  {url.match(/\.(mp4|mov|webm)$/i) ? (
                    <video
                      src={url}
                      controls
                      style={{ maxWidth: '100%', borderRadius: 8 }}
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`media-${i}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        borderRadius: 8,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      ))}
    </>
  );
}
