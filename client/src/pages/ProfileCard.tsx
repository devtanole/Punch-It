import { useUser } from '../components/useUser';
import { Typography, Button, Box, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

export function ProfileCard() {
  const { user } = useUser();

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2">Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Link to={`/profile/${user.userId}`} style={{ textDecoration: 'none' }}>
      <Button variant="contained" color="primary">
        View Profile
      </Button>
    </Link>
  );
}
