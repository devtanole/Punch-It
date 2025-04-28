import { useState, useEffect } from 'react';
import {
  Typography,
  CircularProgress,
  Container,
  Box,
  Paper,
  Avatar,
} from '@mui/material';
import type {
  User,
  FighterUser,
  PromoterUser,
} from '../components/UserContext';
import { useParams } from 'react-router-dom';
// import { updateProfile } from '../lib/data';

type Profile = User | FighterUser | PromoterUser;

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${userId}`);
        const data: Profile = await response.json();
        setProfile(data);
      } catch (err) {
        setError('Error fetching profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="center" mb={4}>
          <Avatar
            alt="Profile Picture"
            src={profile?.profilePictureUrl || '/default-avatar.png'}
            sx={{ width: 100, height: 100 }}
          />
        </Box>
        <Typography variant="h4" align="center" gutterBottom>
          {profile?.username}'s Profile
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1">Location: {profile?.location}</Typography>
          <Typography variant="body2">
            Bio: {profile?.bio || 'No bio available'}
          </Typography>

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
                Gym: {(profile as FighterUser).gymName || 'No gym info'}
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
              <Typography variant="h6">
                Next Event:{' '}
                {(profile as PromoterUser).nextEvent || 'No upcoming event'}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
