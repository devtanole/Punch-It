import { Typography } from '@mui/material';
import { FighterUser, PromoterUser } from '../../components/UserContext';

type Props = {
  profile: FighterUser | PromoterUser;
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

export function AboutTab({ profile }: Props) {
  if (profile.userType === 'fighter') {
    const f = profile as FighterUser;
    return (
      <>
        <Typography>Weight: {f.weight} lbs</Typography>
        <Typography>Height: {f.height}</Typography>
        <Typography>Record: {f.record}</Typography>
        {f.gymName && <Typography>Gym: {f.gymName}</Typography>}
        <Typography>Pullouts: {f.pullouts}</Typography>
        <Typography>Weight Misses: {f.weightMisses}</Typography>
        <Typography>Finishes: {f.finishes}</Typography>
      </>
    );
  }

  const p = profile as PromoterUser;
  return (
    <>
      <Typography>Promotion: {p.promotion}</Typography>
      <Typography>Promoter: {p.promoter}</Typography>
      <Typography>Next Event: {formatUTCDate(p.nextEvent)}</Typography>
    </>
  );
}
