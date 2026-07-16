import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  CircularProgress,
  Divider,
  Box,
} from '@mui/material';
import { fetchConversations } from '../lib/data';
import { ConversationPreview } from '../lib/types';
import { useUser } from '../components/useUser';

export function MessagesInbox() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchConversations();
        setConversations(data);
      } catch (err) {
        setError('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  if (!user)
    return <Typography sx={{ mt: 4, ml: 2 }}>Please sign in.</Typography>;
  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error)
    return (
      <Typography color="error" sx={{ mt: 4, ml: 2 }}>
        {error}
      </Typography>
    );

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight={600}>
            Messages
          </Typography>
        </Box>

        {conversations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No conversations yet.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {conversations.map((convo, i) => (
              <Box key={convo.conversationId}>
                <ListItem
                  onClick={() => navigate(`/messages/${convo.conversationId}`)}
                  sx={{
                    py: 2,
                    px: 3,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}>
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      badgeContent={
                        convo.unreadCount > 0 ? convo.unreadCount : null
                      }>
                      <Avatar
                        src={
                          convo.otherProfilePictureUrl ||
                          '/images/Avatar-Default.webp'
                        }
                        alt={convo.otherUsername}
                      />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        fontWeight={convo.unreadCount > 0 ? 700 : 400}>
                        {convo.otherFullName}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        fontWeight={convo.unreadCount > 0 ? 600 : 400}>
                        {convo.lastMessage ?? 'No messages yet'}
                      </Typography>
                    }
                  />
                  {convo.lastMessageAt && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                      {new Date(convo.lastMessageAt).toLocaleDateString()}
                    </Typography>
                  )}
                </ListItem>
                {i < conversations.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
