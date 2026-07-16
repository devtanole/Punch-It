import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Paper,
  Typography,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { removeFight } from '../../lib/data';
import { FightHistory } from '../../lib/types';

type Props = {
  fights: FightHistory[];
  fullName: string;
  isOwner: boolean;
  onFightDeleted: (fightId: number) => void;
};

export function FightsTab({
  fights,
  fullName,
  isOwner,
  onFightDeleted,
}: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFightId, setSelectedFightId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!selectedFightId) return;
    try {
      await removeFight(selectedFightId);
      onFightDeleted(selectedFightId);
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      setError('Failed to delete fight.');
    }
  };

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}>
        <Typography variant="h6">{fullName}'s Fight History</Typography>
        {isOwner && (
          <IconButton
            component={Link}
            to="/fights/new"
            color="primary"
            aria-label="Add Fight">
            <AddIcon />
          </IconButton>
        )}
      </Stack>

      {error && <Typography color="error">{error}</Typography>}

      {fights.length === 0 ? (
        <Typography color="text.secondary">No fight history yet.</Typography>
      ) : (
        fights.map((fight) => (
          <Paper key={fight.fightId} sx={{ p: 2, mb: 2 }}>
            <Typography>
              Date: {new Date(fight.date).toLocaleDateString()}
            </Typography>
            <Typography>Outcome: {fight.outcome}</Typography>
            <Typography>Decision: {fight.decision}</Typography>
            <Typography>Promotion: {fight.promotion}</Typography>
            {isOwner && (
              <Box mt={1}>
                <IconButton
                  color="error"
                  aria-label="Delete fight"
                  onClick={() => {
                    setSelectedFightId(fight.fightId);
                    setOpenDialog(true);
                  }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Paper>
        ))
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delete Fight</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this fight record?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
