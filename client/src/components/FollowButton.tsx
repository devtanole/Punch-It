import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { followUser, unfollowUser } from '../lib/data';

type Props = {
  userId: number;
  initialIsFollowing: boolean;
  onFollowChange: (isFollowing: boolean) => void;
};

export function FollowButton({
  userId,
  initialIsFollowing,
  onFollowChange,
}: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        onFollowChange(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
        onFollowChange(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={isFollowing ? 'outlined' : 'contained'}
      onClick={handleClick}
      disabled={loading}
      sx={{ minWidth: 100 }}>
      {loading ? (
        <CircularProgress size={20} />
      ) : isFollowing ? (
        'Unfollow'
      ) : (
        'Follow'
      )}
    </Button>
  );
}
