import { Box, Divider, Typography } from '@mui/material';
import { FighterUser, PromoterUser } from '../../components/UserContext';

type Props = {
  profile: FighterUser | PromoterUser;
};

type StatRow = {
  label: string;
  value: string | number | null | undefined;
};

function formatUTCDate(value: string | Date | undefined): string {
  if (!value) return 'No event scheduled.';
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'No event scheduled.';
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
}

function StatRow({ label, value }: StatRow) {
  if (!value && value !== 0) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export function AboutTab({ profile }: Props) {
  if (profile.userType === 'fighter') {
    const f = profile as FighterUser;
    return (
      <Box>
        <StatRow label="Record" value={f.record} />
        <StatRow label="Weight" value={f.weight ? `${f.weight} lbs` : null} />
        <StatRow label="Height" value={f.height} />
        {/* <StatRow label="Weight Class" value={f.weight} /> */}
        <StatRow label="Gym" value={f.gymName} />
        <Divider sx={{ my: 2 }} />
        <StatRow label="Finishes" value={f.finishes} />
        <StatRow label="Pullouts" value={f.pullouts} />
        <StatRow label="Weight Misses" value={f.weightMisses} />
      </Box>
    );
  }

  const p = profile as PromoterUser;
  return (
    <Box>
      <StatRow label="Promotion" value={p.promotion} />
      <StatRow label="Promoter" value={p.promoter} />
      <StatRow label="Next Event" value={formatUTCDate(p.nextEvent)} />
    </Box>
  );
}
