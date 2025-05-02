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
  Tabs,
  Tab,
} from '@mui/material';
import {
  User,
  FighterUser,
  PromoterUser,
  isFighterUser,
  isPromoterUser,
} from '../components/UserContext';
import { useParams } from 'react-router-dom';
import type { Post, FightHistory } from '../lib/data';
import { UpdateForm } from './UpdateProfPage';
import { useUser } from '../components/useUser';

export type Profile = User | FighterUser | PromoterUser;

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [fights, setFights] = useState<FightHistory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUser();
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchProfileAndData = async () => {
      try {
        const profileResponse = await fetch(`/api/profile/${userId}`);
        const profileData: Profile = await profileResponse.json();
        setProfile(profileData);

        const postsResponse = await fetch(`/api/profile/${userId}/posts`);
        const postsData = await postsResponse.json();
        setPosts(postsData);

        if (profileData.userType === 'fighter') {
          const fightsResponse = await fetch(`/api/profile/${userId}/fights`);
          const fightsData = await fightsResponse.json();
          setFights(fightsData);
        }
      } catch (err) {
        setError('Error fetching profile or data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndData();
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const isFighter = profile?.userType === 'fighter';

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
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Button
              variant="contained"
              onClick={() => setIsEditing((prev) => !prev)}>
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
              setProfile={setProfile}
            />
          ) : isPromoterUser(profile) ? (
            <UpdateForm
              userType="promoter"
              promoProf={profile}
              userId={profile.userId}
              setIsEditing={setIsEditing}
              setProfile={setProfile}
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

              {isFighter && (
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
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}>
            <Tab label="Posts" />
            {isFighter && <Tab label="Fight History" />}
          </Tabs>

          {tabIndex === 0 && (
            <Box mt={2}>
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
                            post.profilePictureUrl ||
                            '/images/Avatar-Default.webp'
                          }
                          sx={{ width: 40, height: 40, mr: 2 }}
                        />
                        <Typography variant="body1" fontWeight="bold">
                          {post.username}
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {post.textContent}
                      </Typography>
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
            </Box>
          )}

          {tabIndex === 1 && isFighter && (
            <Box mt={2}>
              <Typography variant="h5" gutterBottom>
                {profile?.fullName}'s Fight History
              </Typography>
              {fights.length > 0 ? (
                fights.map((fight) => (
                  <Box key={fight.fightId} mb={2}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body1">
                        Date: {new Date(fight.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1">
                        Outcome: {fight.outcome}
                      </Typography>
                      <Typography variant="body1">
                        Decision: {fight.decision}
                      </Typography>
                      <Typography variant="body1">
                        Promotion: {fight.promotion}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              ) : (
                <Typography>No fight history available.</Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
