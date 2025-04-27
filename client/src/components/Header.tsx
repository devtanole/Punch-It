import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useUser } from './useUser';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';

export function Header() {
  const { user, handleSignOut } = useUser();
  const navigate = useNavigate();

  function handleClick(): void {
    handleSignOut();
    navigate('/');
  }
  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'white' }}>
        <Toolbar>
          <Container sx={{ display: 'flex', alignItems: 'center' }}>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}>
              <img
                src="/images/gloveLogo.png"
                alt="punch it boxing glove logo"
                style={{ height: 50, width: 'auto', marginRight: 10 }}
              />
            </Link>

            <Box
              sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'Bangers',
                  color: 'black',
                  textAlign: 'center',
                }}>
                Punch It
              </Typography>
            </Box>
            <div>
              {user ? (
                <Button color="primary" onClick={handleClick}>
                  Logout
                </Button>
              ) : (
                <Link to="/auth/sign-in" style={{ textDecoration: 'none' }}>
                  <Button color="primary">Login</Button>
                </Link>
              )}
            </div>
          </Container>
        </Toolbar>
      </AppBar>

      <Outlet />
    </>
  );
}
