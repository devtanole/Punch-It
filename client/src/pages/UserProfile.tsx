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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
// import EditSharpIcon from '@mui/icons-material/EditSharp';
import {
  User,
  FighterUser,
  PromoterUser,
  isFighterUser,
  isPromoterUser,
} from '../components/UserContext';
import { useParams, Link } from 'react-router-dom';
import { UpdateForm } from './UpdateProfPage';
import { useUser } from '../components/useUser';
import DeleteIcon from '@mui/icons-material/Delete';
import { removeFight, Post, FightHistory } from '../lib/data';

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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFightId, setSelectedFightId] = useState<number | null>(null);

  const isOwner = user?.userId === Number(userId);
  const isFighter = profile?.userType === 'fighter';

  useEffect(() => {
    const fetchProfileAndData = async () => {
      try {
        const profileRes = await fetch(`/api/profile/${userId}`);
        const profileData: Profile = await profileRes.json();
        console.log('Fetched profile:', profileData);
        setProfile(profileData);

        const postsRes = await fetch(`/api/profile/${userId}/posts`);
        const postsData = await postsRes.json();
        setPosts(postsData);

        if (profileData.userType === 'fighter') {
          const fightsRes = await fetch(`/api/profile/${userId}/fights`);
          const fightsData = await fightsRes.json();
          setFights(fightsData);
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching profile or data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndData();
  }, [userId]);

  const handleDeleteFight = async () => {
    if (!selectedFightId) return;
    try {
      await removeFight(selectedFightId);
      setFights((prev) =>
        prev.filter((fight) => fight.fightId !== selectedFightId)
      );
      setOpenDialog(false);
    } catch (err) {
      console.error('Error deleting fight:', err);
      setError('Error deleting fight');
    }
  };

  const handleDialogOpen = (fightId: number) => {
    setSelectedFightId(fightId);
    setOpenDialog(true);
  };

  const handleDialogClose = () => setOpenDialog(false);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!profile) return null;

  // const formatDate = (dateStr: string) => {
  //   const date = new Date(dateStr);
  //   return date.toDateString(); // Adjust date format as needed
  // };

  function formatUTCDate(date: Date) {
    const month = date.getUTCMonth() + 1; // getUTCMonth() is 0-indexed
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    // Pad single digits with leading zero (optional, for consistent format)
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');

    return `${paddedMonth}/${paddedDay}/${year}`;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        {/* Profile Header */}
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

        {/* Edit Form */}
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
            {/* Tabs */}
            <Tabs
              value={tabIndex}
              onChange={(_, v) => setTabIndex(v)}
              sx={{ mb: 2 }}>
              <Tab label="Posts" />
              {isFighter && <Tab label="Fights" />}
              <Tab label="About" />
            </Tabs>

            {/* Tab Content */}
            {tabIndex === 0 && (
              <Box>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Paper key={post.postId} sx={{ p: 2, mb: 3 }}>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        mb={2}>
                        <Avatar
                          src={
                            post.profilePictureUrl ||
                            '/images/Avatar-Default.webp'
                          }
                          sx={{ width: 40, height: 40 }}
                        />
                        <Typography fontWeight="bold">
                          {post.username}
                        </Typography>
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
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={2}>
                        Posted on {new Date(post.createdAt).toLocaleString()}
                      </Typography>
                      {/* {isOwner && (
                        <IconButton
                          component={Link}
                          to={`details/${post.postId}`}
                          color="primary"
                          aria-label="Edit Post"
                          sx={{ position: 'absolute', top: 16, right: 16 }}>
                          <EditSharpIcon />
                        </IconButton>
                      )} */}
                    </Paper>
                  ))
                ) : (
                  <Typography>No posts available.</Typography>
                )}
              </Box>
            )}

            {tabIndex === 1 && isFighter ? (
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}>
                  <Typography variant="h6">
                    {profile.fullName}'s Fight History
                  </Typography>
                  {isOwner && (
                    <IconButton
                      component={Link}
                      to={'/fights/new'}
                      color="primary"
                      aria-label="Add Fight">
                      <AddIcon />
                    </IconButton>
                  )}
                </Stack>
                {fights.length > 0 ? (
                  fights.map((fight) => (
                    <Paper key={fight.fightId} sx={{ p: 2, mb: 2 }}>
                      <Typography>
                        Date: {new Date(fight.date).toLocaleDateString()}
                      </Typography>
                      <Typography>Outcome: {fight.outcome}</Typography>
                      <Typography>Decision: {fight.decision}</Typography>
                      <Typography>Promotion: {fight.promotion}</Typography>
                      {isOwner && (
                        <IconButton
                          color="error"
                          onClick={() => handleDialogOpen(fight.fightId)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Paper>
                  ))
                ) : (
                  <Typography>No fight history available.</Typography>
                )}
              </Box>
            ) : tabIndex === 1 && isPromoterUser(profile) ? (
              <>
                <Typography>Promotion: {profile.promotion}</Typography>
                <Typography>Promoter: {profile.promoter}</Typography>
                <Typography>
                  Next Event:{' '}
                  {profile.nextEvent
                    ? formatUTCDate(new Date(profile.nextEvent))
                    : 'No event scheduled.'}
                </Typography>
              </>
            ) : null}

            {tabIndex === 2 && (
              <Box>
                {isFighterUser(profile) && (
                  <>
                    <Typography>Weight: {profile.weight} lbs</Typography>
                    <Typography>Height: {profile.height}</Typography>
                    <Typography>Record: {profile.record}</Typography>
                    <Typography>Gym: {profile.gymName}</Typography>
                    <Typography>Pullouts: {profile.pullouts}</Typography>
                    <Typography>
                      Weight Misses: {profile.weightMisses}
                    </Typography>
                    <Typography>Finishes: {profile.finishes}</Typography>
                  </>
                )}
                {isPromoterUser(profile) && (
                  <>
                    <Typography>Promotion: {profile.promotion}</Typography>
                    <Typography>Promoter: {profile.promoter}</Typography>
                    <Typography>
                      Promoter:{' '}
                      {profile.nextEvent
                        ? formatUTCDate(profile.nextEvent)
                        : 'No event scheduled.'}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </>
        )}

        {/* Delete Fight Dialog */}
        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this fight?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button color="error" onClick={handleDeleteFight}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}
