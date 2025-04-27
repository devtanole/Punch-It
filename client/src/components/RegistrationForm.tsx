import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { User } from './UserContext';
import {
  ConditionalFormFields,
  type FighterProps,
  type PromoterProps,
} from './ConditionalFormFields';
import { UserAvatar } from './UserAvatar';
import {
  TextField,
  MenuItem,
  Button,
  InputLabel,
  FormControl,
  Select,
  SelectChangeEvent,
} from '@mui/material';

// const defaultAvi = '/images/AvatarDefault';

export function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'fighter' | 'promoter'>('fighter');
  const [preview, setPreview] = useState<string>('/images/AvatarDefault.webp');
  const navigate = useNavigate();

  const [fighterFormData, setFighterFormData] = useState<FighterProps>({
    weight: 0,
    height: '',
    record: '',
    gymName: '',
    pullouts: 0,
    weightMisses: 0,
    finishes: 0,
  });

  const [promoterFormData, setPromoterFormData] = useState<PromoterProps>({
    promotion: '',
    promoter: '',
    nextEvent: '',
  });

  const handleChange = (name: string, value: string) => {
    if (userType === 'fighter') {
      setFighterFormData({
        ...fighterFormData,
        [name]:
          name === 'weight' ||
          name === 'pullouts' ||
          name === 'weightMisses' ||
          name === 'finishes'
            ? parseInt(value)
            : value,
      });
    } else {
      setPromoterFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUserTypeChange = (e: SelectChangeEvent) => {
    setUserType(e.target.value as 'fighter' | 'promoter');
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData);

      const fullUserData = {
        ...userData,
        ...(userType === 'fighter' ? fighterFormData : promoterFormData),
        userType,
        profilePictureUrl: preview,
      };
      console.log('fullUserData:', fullUserData);
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullUserData),
      };
      const res = await fetch('/api/auth/sign-up', req);
      if (!res.ok) {
        throw new Error(`fetch Error ${res.status}`);
      }
      const user = (await res.json()) as User;
      console.log('Registered', user);
      alert(
        `Successfully registered ${user.username} as userId ${user.userId}.`
      );
      navigate('/auth/sign-in');
    } catch (err) {
      alert(`Error registering user: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-3 container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <UserAvatar
            preview={preview}
            setPreview={setPreview}
            onUpload={(url) => setPreview(url)}
          />
        </div>

        <TextField
          required
          name="username"
          label="Username"
          fullWidth
          margin="normal"
        />

        <TextField
          required
          name="password"
          label="Password"
          type="password"
          fullWidth
          margin="normal"
        />

        <TextField
          required
          name="fullName"
          label="Full Name"
          fullWidth
          margin="normal"
        />

        <TextField
          required
          name="email"
          label="Email"
          type="email"
          fullWidth
          margin="normal"
        />

        <TextField required name="bio" label="Bio" fullWidth margin="normal" />

        <TextField
          required
          name="location"
          label="Location"
          fullWidth
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>User Type</InputLabel>
          <Select
            name="userType"
            value={userType}
            label="User Type"
            onChange={handleUserTypeChange}>
            <MenuItem value="fighter">Fighter</MenuItem>
            <MenuItem value="promoter">Promoter</MenuItem>
          </Select>
        </FormControl>

        <ConditionalFormFields
          userType={userType}
          fighterFormData={fighterFormData}
          promoterFormData={promoterFormData}
          onChange={handleChange}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading}
          sx={{ mt: 2 }}>
          Sign Up
        </Button>
      </form>

      <Link to="/auth/sign-in" style={{ display: 'block', marginTop: '1rem' }}>
        Already have an account? Sign In
      </Link>
    </div>
  );
}
