import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Stack,
} from '@mui/material';
import { FightHistory } from '../lib/data';
import { Link } from 'react-router-dom';
import EditSharpIcon from '@mui/icons-material/EditSharp';

type FightHistoryCardProps = {
  fight: FightHistory;
};

function FightHistoryCard({ fight }: FightHistoryCardProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box>
            <Typography variant="h6" component="span">
              <Link
                to={`/profile/${fight.fighterId}`}
                style={{ color: 'inherit', textDecoration: 'none' }}>
                {fight.username}
              </Link>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date(fight.date).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            component={Link}
            to={`details/${fight.fightId}`}
            color="primary">
            <EditSharpIcon />
          </IconButton>
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Outcome: {fight.outcome}</Typography>
          <Typography variant="body1">Decision: {fight.decision}</Typography>
          <Typography variant="body1">Promotion: {fight.promotion}</Typography>
        </Box>
      </CardContent>

      <Divider />
    </Card>
  );
}

export { FightHistoryCard };
