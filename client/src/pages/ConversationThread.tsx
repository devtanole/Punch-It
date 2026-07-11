import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  IconButton,
  TextField,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { fetchMessages, sendMessage } from '../lib/data';
import { Message } from '../lib/types';
import { useUser } from '../components/useUser';

export function ConversationThread() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMessages(Number(conversationId));
        setMessages(data);
      } catch (err) {
        setError('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [conversationId, user]);

  // Scroll to bottom when messages load or a new one arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!text.trim() || !conversationId) return;
    setSending(true);
    try {
      const newMessage = await sendMessage(Number(conversationId), text.trim());
      setMessages((prev) => [...prev, newMessage]);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!user)
    return <Typography sx={{ mt: 4, ml: 2 }}>Please sign in.</Typography>;
  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error)
    return (
      <Typography color="error" sx={{ mt: 4, ml: 2 }}>
        {error}
      </Typography>
    );

  // Derive the other person's name from the first message we didn't send
  const otherUser = messages.find((m) => m.senderId !== user.userId);

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        pb: 2,
      }}>
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
          <IconButton onClick={() => navigate('/messages')} size="small">
            <ArrowBackIcon />
          </IconButton>
          {otherUser && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={
                  otherUser.profilePictureUrl || '/images/Avatar-Default.webp'
                }
                sx={{ width: 32, height: 32 }}
              />
              <Typography fontWeight={600}>{otherUser.username}</Typography>
            </Stack>
          )}
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {messages.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" mt={4}>
              No messages yet. Say hello!
            </Typography>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === user.userId;
              return (
                <Box
                  key={msg.messageId}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    mb: 1.5,
                  }}>
                  {!isOwn && (
                    <Avatar
                      src={
                        msg.profilePictureUrl || '/images/Avatar-Default.webp'
                      }
                      sx={{ width: 28, height: 28, mr: 1, mt: 0.5 }}
                    />
                  )}
                  <Box>
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: isOwn
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                        bgcolor: isOwn ? 'primary.main' : 'grey.100',
                        color: isOwn ? 'primary.contrastText' : 'text.primary',
                        maxWidth: 280,
                        wordBreak: 'break-word',
                      }}>
                      <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        textAlign: isOwn ? 'right' : 'left',
                      }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={bottomRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={sending || !text.trim()}
              sx={{ mb: 0.5 }}>
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
