import { useUser } from '../components/useUser';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
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
    <Card sx={{ width: 250, p: 2 }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Avatar
          src={user.profilePictureUrl || '/images/AvatarDefault.webp'}
          alt={user.username}
          sx={{ width: 80, height: 80, margin: '0 auto', mb: 1 }}
        />
        <Typography variant="h6">{user.fullName}</Typography>
        <Typography variant="body2" color="text.secondary">
          @{user.username}
        </Typography>
        <Button
          component={Link}
          to={`/profile/${user.userId}`}
          variant="outlined"
          sx={{ mt: 2 }}
          fullWidth>
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
