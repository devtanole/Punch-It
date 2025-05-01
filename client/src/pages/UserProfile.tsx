import { useState, useEffect } from 'react';
import {
  Typography,
  CircularProgress,
  Container,
  Box,
  Paper,
  Avatar,
  Stack,
  Button,
} from '@mui/material';
import {
  User,
  FighterUser,
  PromoterUser,
  isFighterUser,
  isPromoterUser,
} from '../components/UserContext';
import { useParams } from 'react-router-dom';
import type { Post } from '../lib/data';
import { UpdateForm } from './UpdateProfPage';
import { useUser } from '../components/useUser';

// import { updateProfile } from '../lib/data';

export type Profile = User | FighterUser | PromoterUser;

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { user } = useUser();

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        const profileResponse = await fetch(`/api/profile/${userId}`);
        const profileData: Profile = await profileResponse.json();
        setProfile(profileData);
        const postsResponse = await fetch(`/api/profile/${userId}/posts`);
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } catch (err) {
        setError('Error fetching profile or posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="center" mb={4}>
          <Avatar
            alt="Profile Picture"
            src={profile?.profilePictureUrl || '/images/Avatar-Default.webp'}
            sx={{ width: 100, height: 100 }}
          />
        </Box>
        {user?.userId === Number(userId) && (
          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="contained"
              onClick={() => setIsEditing((prevState) => !prevState)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Stack>
        )}

        {isEditing && profile ? (
          isFighterUser(profile) ? (
            <UpdateForm
              userType="fighter"
              fighterProf={profile}
              userId={profile.userId}
              setIsEditing={setIsEditing}
            />
          ) : isPromoterUser(profile) ? (
            <UpdateForm
              userType="promoter"
              promoProf={profile}
              userId={profile.userId}
              setIsEditing={setIsEditing}
            />
          ) : null
        ) : (
          <>
            <Typography variant="h4" align="center" gutterBottom>
              {profile?.fullName}
            </Typography>
            <Typography variant="body1" align="center" gutterBottom>
              @{profile?.username}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1">
                Location: {profile?.location}
              </Typography>
              <Typography variant="body2">Bio: {profile?.bio || ''}</Typography>

              {profile?.userType === 'fighter' && (
                <Box>
                  <Typography variant="h6">
                    Weight: {(profile as FighterUser).weight} lbs
                  </Typography>
                  <Typography variant="h6">
                    Height: {(profile as FighterUser).height}
                  </Typography>
                  <Typography variant="h6">
                    Record: {(profile as FighterUser).record}
                  </Typography>
                  <Typography variant="h6">
                    Gym: {(profile as FighterUser).gymName}
                  </Typography>
                  <Typography variant="h6">
                    Pullouts: {(profile as FighterUser).pullouts}
                  </Typography>
                  <Typography variant="h6">
                    Weight Misses: {(profile as FighterUser).weightMisses}
                  </Typography>
                  <Typography variant="h6">
                    Finishes: {(profile as FighterUser).finishes}
                  </Typography>
                </Box>
              )}

              {profile?.userType === 'promoter' && (
                <Box>
                  <Typography variant="h6">
                    Promotion: {(profile as PromoterUser).promotion}
                  </Typography>
                  <Typography variant="h6">
                    Promoter: {(profile as PromoterUser).promoter}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            {profile?.fullName}'s Post History
          </Typography>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Box key={post.postId} mb={4}>
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      alt={post.username}
                      src={
                        post.profilePictureUrl || '/images/Avatar-Default.webp'
                      }
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Typography variant="body1" fontWeight="bold">
                      {post.username}
                    </Typography>
                  </Box>

                  <Typography variant="body1">{post.textContent}</Typography>

                  {post.mediaUrls.length > 0 && (
                    <Box mt={2}>
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
                  <Typography variant="body2" color="textSecondary" mt={2}>
                    Posted on {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </Paper>
              </Box>
            ))
          ) : (
            <Typography>No posts available</Typography>
          )}
          {/* </Box> */}
        </Box>
      </Paper>
    </Container>
  );
}
