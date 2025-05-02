import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  type FightHistory,
  type NewFightEntry,
  readFight,
  addFight,
  updateFight,
  removeFight,
} from '../lib/data';
import {
  CircularProgress,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
} from '@mui/material';

export function FightHistoryForm() {
  const { fightId } = useParams();
  const navigate = useNavigate();
  const isEditing = fightId && fightId !== 'new';

  const [fight, setFight] = useState<FightHistory>();
  const [date, setDate] = useState('');
  const [outcome, setOutcome] = useState('');
  const [decision, setDecision] = useState('');
  const [promotion, setPromotion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load(id: number) {
      setIsLoading(true);
      try {
        const fight = await readFight(id);
        if (!fight) throw new Error(`Fight with ID ${id} not found`);
        setFight(fight);
        setDate(fight.date);
        setOutcome(fight.outcome);
        setDecision(fight.decision);
        setPromotion(fight.promotion);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isEditing && fightId) load(+fightId);
  }, [fightId, isEditing]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newFight: NewFightEntry = { date, outcome, decision, promotion };

    try {
      if (isEditing) {
        if (!fight) {
          alert('Fight data is missing.');
          return;
        }
        await updateFight(fight.fightId, newFight);
      } else {
        await addFight(newFight);
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      alert(`Error saving fight: ${String(err)}`);
    }
  }

  async function handleDelete() {
    if (!fight) {
      alert('No fight to delete.');
      return;
    }

    try {
      setIsDeleting(true);
      await removeFight(fight.fightId);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(`Error deleting fight: ${String(err)}`);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <CircularProgress />;
  if (error) {
    return (
      <Alert severity="error">
        Error Loading Fight with ID {fightId}:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </Alert>
    );
  }

  return (
    <Box maxWidth={600} mx="auto" p={2}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Fight' : 'New Fight'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Outcome"
            select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            required>
            <MenuItem value="Win">Win</MenuItem>
            <MenuItem value="Loss">Loss</MenuItem>
            <MenuItem value="Draw">Draw</MenuItem>
          </TextField>

          <TextField
            label="Decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            required
          />

          <TextField
            label="Promotion"
            value={promotion}
            onChange={(e) => setPromotion(e.target.value)}
            required
          />

          <Stack direction="row" justifyContent="space-between">
            {isEditing && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setIsDeleting(true)}>
                Delete Fight
              </Button>
            )}
            <Button type="submit" variant="contained">
              {isEditing ? 'Update Fight' : 'Add Fight'}
            </Button>
          </Stack>
        </Stack>
      </form>

      <Dialog open={isDeleting} onClose={() => setIsDeleting(false)}>
        <DialogTitle>Delete Fight</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this fight?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleting(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
