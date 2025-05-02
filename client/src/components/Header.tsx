import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useUser } from './useUser';
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export function Header() {
  const { user, handleSignOut } = useUser();
  const navigate = useNavigate();

  const [logoMenuAnchorEl, setLogoMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  function handleLogout(): void {
    handleSignOut();
    navigate('/');
  }

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?username=${query}`);
      if (!response.ok) throw new Error('Search failed');
      const users = await response.json();
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'white' }}>
        <Toolbar>
          <Container sx={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              <IconButton onClick={(e) => setLogoMenuAnchorEl(e.currentTarget)}>
                <img
                  src="/images/gloveLogo.png"
                  alt="punch it boxing glove logo"
                  style={{ height: 50, width: 'auto' }}
                />
              </IconButton>
            ) : (
              <img
                src="/images/gloveLogo.png"
                alt="punch it boxing glove logo"
                style={{ height: 50, width: 'auto' }}
              />
            )}

            {user && (
              <Menu
                anchorEl={logoMenuAnchorEl}
                open={Boolean(logoMenuAnchorEl)}
                onClose={() => setLogoMenuAnchorEl(null)}>
                <MenuItem
                  onClick={() => {
                    navigate(`/profile/${user.userId}`);
                    setLogoMenuAnchorEl(null);
                  }}>
                  View Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/');
                    setLogoMenuAnchorEl(null);
                  }}>
                  Home
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/details/new');
                    setLogoMenuAnchorEl(null);
                  }}>
                  Post
                </MenuItem>
              </Menu>
            )}
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
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  value={searchQuery}
                  onChange={handleSearchChange}
                  label="Search Users"
                  variant="outlined"
                  size="small"
                  sx={{ marginRight: 1 }}
                />
                <IconButton
                  onClick={(e) => setSearchAnchorEl(e.currentTarget)}
                  color="primary">
                  <SearchIcon />
                </IconButton>
              </Box>
            )}
            <Menu
              anchorEl={searchAnchorEl}
              open={Boolean(searchAnchorEl)}
              onClose={() => setSearchAnchorEl(null)}>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <MenuItem
                    key={user.userId}
                    onClick={() => {
                      navigate(`/profile/${user.userId}`);
                      setSearchAnchorEl(null);
                    }}>
                    {user.username}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No results found</MenuItem>
              )}
            </Menu>
            <div>
              {user ? (
                <Button color="primary" onClick={handleLogout}>
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
