import { TextField } from '@mui/material';

export type FighterProps = {
  fullName?: string;
  location?: string;
  userId?: number;
  bio?: string;
  weight: number;
  height: string;
  record: string;
  gymName?: string;
  pullouts: number;
  weightMisses: number;
  finishes: number;
};

export type PromoterProps = {
  fullName?: string;
  userId?: number;
  location?: string;
  bio?: string;
  promotion: string;
  promoter: string;
  nextEvent?: Date;
};

type UserProps = {
  userType: 'fighter' | 'promoter';
  fighterFormData: FighterProps;
  promoterFormData: PromoterProps;
  onChange: (name: string, value: string) => void;
};

export function ConditionalFormFields({
  userType,
  fighterFormData,
  promoterFormData,
  onChange,
}: UserProps) {
  return (
    <div>
      <h3>{userType === 'fighter' ? 'Fighter' : 'Promoter'} Account</h3>
      {userType === 'fighter' ? (
        <>
          <TextField
            label="Weight"
            type="number"
            name="weight"
            required
            fullWidth
            value={fighterFormData.weight || ''}
            onChange={(e) => onChange('weight', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Height"
            type="text"
            name="height"
            required
            fullWidth
            value={fighterFormData.height}
            onChange={(e) => onChange('height', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Record"
            type="text"
            name="record"
            required
            fullWidth
            value={fighterFormData.record}
            onChange={(e) => onChange('record', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Gym Name"
            type="text"
            name="gymName"
            fullWidth
            value={fighterFormData.gymName}
            onChange={(e) => onChange('gymName', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Pullouts"
            type="number"
            name="pullouts"
            required
            fullWidth
            value={fighterFormData.pullouts}
            onChange={(e) => onChange('pullouts', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Weight Misses"
            type="number"
            name="weightMisses"
            required
            fullWidth
            value={fighterFormData.weightMisses}
            onChange={(e) => onChange('weightMisses', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Finishes"
            type="number"
            name="finishes"
            required
            fullWidth
            value={fighterFormData.finishes}
            onChange={(e) => onChange('finishes', e.target.value)}
            margin="normal"
          />
        </>
      ) : (
        <>
          <TextField
            label="Promotion"
            type="text"
            name="promotion"
            required
            fullWidth
            value={promoterFormData.promotion}
            onChange={(e) => onChange('promotion', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Promoter"
            type="text"
            name="promoter"
            required
            fullWidth
            value={promoterFormData.promoter}
            onChange={(e) => onChange('promoter', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Next Event"
            type="date"
            name="nextEvent"
            fullWidth
            value={promoterFormData.nextEvent}
            onChange={(e) => onChange('nextEvent', e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </>
      )}
    </div>
  );
}
