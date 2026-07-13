import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import { useUser } from '../components/useUser';

const features = [
  {
    icon: <SportsMmaIcon fontSize="large" color="primary" />,
    title: 'Built for Fighters',
    description:
      'Track your fight record, showcase your stats, and build a profile that speaks for itself inside and outside the gym.',
  },
  {
    icon: <EmojiEventsIcon fontSize="large" color="primary" />,
    title: 'Find Opportunities',
    description:
      'Promoters browse Punch It to find talent for their cards. Put your career in front of the people who can advance it.',
  },
  {
    icon: <GroupIcon fontSize="large" color="primary" />,
    title: 'Connect with the Community',
    description:
      'Follow fighters, message promoters, and stay connected with the combat sports world in one place.',
  },
];

export function LandingPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirect logged-in users straight to the feed
  useEffect(() => {
    if (user) navigate('/feed');
  }, [user, navigate]);

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 8, md: 14 },
          textAlign: 'center',
        }}>
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Bangers',
              fontSize: { xs: '4rem', md: '7rem' },
              color: 'primary.main',
              letterSpacing: 2,
              lineHeight: 1,
              mb: 2,
            }}>
            Punch It
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            fontWeight={400}
            sx={{ mb: 4, maxWidth: 520, mx: 'auto' }}>
            The professional network for combat sports athletes and promoters.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center">
            <Button
              component={Link}
              to="/auth/sign-up"
              variant="contained"
              size="large"
              sx={{ px: 5, py: 1.5 }}>
              Get Started
            </Button>
            <Button
              component={Link}
              to="/auth/sign-in"
              variant="outlined"
              size="large"
              sx={{ px: 5, py: 1.5 }}>
              Sign In
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          divider={<Divider orientation="vertical" flexItem />}>
          {features.map((feature) => (
            <Paper
              key={feature.title}
              elevation={0}
              sx={{
                flex: 1,
                p: 4,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <Box mb={2}>{feature.icon}</Box>
              <Typography variant="h6" mb={1}>
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.7}>
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Container>

      {/* CTA strip */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
          bgcolor: 'background.default',
        }}>
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={700} mb={1}>
            Ready to step in?
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Join fighters and promoters already on the platform.
          </Typography>
          <Button
            component={Link}
            to="/auth/sign-up"
            variant="contained"
            size="large"
            sx={{ px: 6, py: 1.5 }}>
            Create Your Profile
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
