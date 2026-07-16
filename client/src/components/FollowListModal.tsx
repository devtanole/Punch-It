import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
} from '@mui/material';
import type { FollowUser } from '../lib/types';

type Props = {
  open: boolean;
  title: 'Followers' | 'Following';
  users: FollowUser[];
  onClose: () => void;
};

export function FollowListModal({ open, title, users, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {users.length === 0 ? (
          <Typography color="text.secondary">
            No {title.toLowerCase()} yet.
          </Typography>
        ) : (
          <List disablePadding>
            {users.map((user) => (
              <ListItem
                key={user.userId}
                component={Link}
                to={`/profile/${user.userId}`}
                onClick={onClose}
                sx={{
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}>
                <ListItemAvatar>
                  <Avatar
                    src={
                      user.profilePictureUrl || '/images/Avatar-Default.webp'
                    }
                    alt={user.username}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={user.fullName}
                  secondary={`@${user.username} · ${user.userType}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
