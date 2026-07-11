import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useUser } from './useUser';
import { useState, useEffect, useRef } from 'react';
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
  Badge,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Chip,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { fetchUnreadCount } from '../lib/data';
import type { SearchResult } from '../lib/types';

export function Header() {
  const { user, handleSignOut } = useUser();
  const navigate = useNavigate();

  const [logoMenuAnchorEl, setLogoMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogout(): void {
    handleSignOut();
    navigate('/');
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.trim() === '') {
      setSearchResults([]);
      setSearchAnchorEl(null);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?username=${query}`);
        if (!response.ok) {
          setSearchResults([]);
          return;
        }
        const users: SearchResult[] = await response.json();
        setSearchResults(users);
        setSearchAnchorEl(searchRef.current);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }, 300);
  };

  function handleResultClick(userId: number) {
    navigate(`/profile/${userId}`);
    setSearchAnchorEl(null);
    setSearchQuery('');
    setSearchResults([]);
  }

  // Poll for unread messages every 30 seconds
  useEffect(() => {
    if (!user) return;

    async function loadUnread() {
      try {
        const data = await fetchUnreadCount();
        setUnreadCount(data.unreadCount);
      } catch (err) {
        console.error(err);
      }
    }

    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'white' }}>
        <Toolbar>
          <Container sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Logo */}
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

            {/* Logo menu */}
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

            {/* Title */}
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

            {/* Search + icons */}
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box ref={searchRef}>
                  <TextField
                    value={searchQuery}
                    onChange={handleSearchChange}
                    label="Search Users"
                    variant="outlined"
                    size="small"
                    autoComplete="off"
                  />
                </Box>

                {/* Search results dropdown */}
                <Menu
                  anchorEl={searchAnchorEl}
                  open={Boolean(searchAnchorEl) && searchResults.length > 0}
                  onClose={() => setSearchAnchorEl(null)}
                  disableAutoFocus
                  disableRestoreFocus
                  sx={{ mt: 1 }}>
                  {searchResults.map((result) => (
                    <MenuItem
                      key={result.userId}
                      onClick={() => handleResultClick(result.userId)}
                      sx={{ gap: 1, minWidth: 260 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar
                          src={
                            result.profilePictureUrl ||
                            '/images/Avatar-Default.webp'
                          }
                          sx={{ width: 32, height: 32 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={result.fullName}
                        secondary={`@${result.username}`}
                      />
                      <Chip
                        label={result.userType}
                        size="small"
                        color={
                          result.userType === 'fighter' ? 'error' : 'primary'
                        }
                        sx={{ ml: 1, textTransform: 'capitalize' }}
                      />
                    </MenuItem>
                  ))}
                </Menu>

                {/* Messages */}
                <IconButton
                  color="primary"
                  onClick={() => navigate('/messages')}>
                  <Badge
                    badgeContent={unreadCount > 0 ? unreadCount : null}
                    color="error">
                    <ChatIcon />
                  </Badge>
                </IconButton>
              </Box>
            )}

            {/* Auth */}
            <Box sx={{ ml: 1 }}>
              {user ? (
                <Button color="primary" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Link to="/auth/sign-in" style={{ textDecoration: 'none' }}>
                  <Button color="primary">Login</Button>
                </Link>
              )}
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      <Outlet />
    </>
  );
}
