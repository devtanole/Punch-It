import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Divider,
} from '@mui/material';
import {
  User,
  FighterUser,
  PromoterUser,
  isFighterUser,
  isPromoterUser,
} from '../../components/UserContext';
import { useUser } from '../../components/useUser';
import { UpdateForm } from './UpdateProfPage';
import { Post, FightHistory } from '../../lib/data';
import { PostsTab } from './PostsTab';
import { FightsTab } from './FightsTab';
import { AboutTab } from './AboutTab';

export type Profile = User | FighterUser | PromoterUser;

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [fights, setFights] = useState<FightHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const isOwner = user?.userId === Number(userId);
  const isFighter = profile?.userType === 'fighter';

  useEffect(() => {
    async function fetchAll() {
      try {
        const profileRes = await fetch(`/api/profile/${userId}`);
        if (!profileRes.ok) throw new Error('Failed to load profile');
        const profileData: Profile = await profileRes.json();
        setProfile(profileData);

        const postsRes = await fetch(`/api/profile/${userId}/posts`);
        if (postsRes.ok) setPosts(await postsRes.json());

        if (profileData.userType === 'fighter') {
          const fightsRes = await fetch(`/api/profile/${userId}/fights`);
          if (fightsRes.ok) setFights(await fightsRes.json());
        }
      } catch (err) {
        console.error(err);
        setError('Error loading profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!profile) return null;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems="center"
          justifyContent="space-between"
          mb={3}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              src={profile.profilePictureUrl || '/images/Avatar-Default.webp'}
              sx={{ width: 100, height: 100 }}
            />
            <Box>
              <Typography variant="h5">{profile.fullName}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                @{profile.username}
              </Typography>
              {profile.location && (
                <Typography variant="body2" color="text.secondary">
                  📍 {profile.location}
                </Typography>
              )}
              {profile.bio && (
                <Typography variant="body2" mt={1}>
                  {profile.bio}
                </Typography>
              )}
            </Box>
          </Stack>
          {isOwner && (
            <Button
              variant={isEditing ? 'outlined' : 'contained'}
              onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Edit form or tabs */}
        {isEditing ? (
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
            <Tabs
              value={tabIndex}
              onChange={(_, v) => setTabIndex(v)}
              sx={{ mb: 2 }}>
              <Tab label="Posts" />
              {isFighter && <Tab label="Fights" />}
              <Tab label="About" />
            </Tabs>

            {tabIndex === 0 && <PostsTab posts={posts} />}

            {tabIndex === 1 && isFighter && (
              <FightsTab
                fights={fights}
                fullName={profile.fullName}
                isOwner={isOwner}
                onFightDeleted={(id) =>
                  setFights((prev) => prev.filter((f) => f.fightId !== id))
                }
              />
            )}

            {tabIndex === 1 && !isFighter && isPromoterUser(profile) && (
              <AboutTab profile={profile} />
            )}

            {tabIndex === 2 &&
              (isFighterUser(profile) || isPromoterUser(profile)) && (
                <AboutTab profile={profile} />
              )}
          </>
        )}
      </Paper>
    </Container>
  );
}
