import { type FormEvent, useState, useEffect } from 'react';

import {
  ConditionalFormFields,
  type FighterProps,
  type PromoterProps,
} from '../components/ConditionalFormFields';
// import { UserAvatar } from '../components/UserAvatar';
import { TextField, Button } from '@mui/material';
import { updateProfile } from '../lib/data';
import { Profile } from './UserProfile';

// const defaultAvi = '/images/AvatarDefault';

type updateProps =
  | {
      userType: 'fighter';
      userId: number;
      fighterProf: FighterProps;
      promoProf?: never;
      setIsEditing: (boolean: boolean) => void;
      setProfile: (u: Profile) => void;
    }
  | {
      userType: 'promoter';
      userId: number;
      fighterProf?: never;
      promoProf: PromoterProps;
      setIsEditing: (boolean: boolean) => void;
      setProfile: (u: Profile) => void;
    };

export function UpdateForm({
  userType,
  setIsEditing,
  fighterProf,
  promoProf,
  setProfile,
}: updateProps) {
  // console.log(setIsEditing);
  const [isLoading, setIsLoading] = useState(false);
  const [userFields, setUserFields] = useState({
    fullName: '',
    bio: '',
    location: '',
  });

  useEffect(() => {
    if (userType === 'fighter' && fighterProf) {
      setUserFields({
        fullName: fighterProf.fullName ?? '',
        bio: fighterProf.bio ?? '',
        location: fighterProf.location ?? '',
      });
      setFighterFormData(fighterProf);
    } else if (userType === 'promoter' && promoProf) {
      setUserFields({
        fullName: promoProf.fullName ?? '',
        bio: promoProf.bio ?? '',
        location: promoProf.location ?? '',
      });
      setPromoterFormData(promoProf);
    }
  }, [userType, fighterProf, promoProf]);

  // const [userFormData, setUserFormData] = useState({
  //   fullName: '',
  //   location: '',
  //   bio: '',
  // });

  const [fighterFormData, setFighterFormData] = useState<FighterProps>({
    fullName: '',
    location: '',
    bio: '',
    weight: 0,
    height: '',
    record: '',
    gymName: '',
    pullouts: 0,
    weightMisses: 0,
    finishes: 0,
  });

  const [promoterFormData, setPromoterFormData] = useState<PromoterProps>({
    fullName: '',
    location: '',
    bio: '',
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsLoading(true);
      let userData;
      if (userType === 'fighter') {
        userData = { ...fighterFormData };
      } else {
        userData = { ...promoterFormData };
      }

      const fullUserData = {
        ...userData,
        ...userFields,
        userType,
      };

      const updatedData = await updateProfile(fullUserData);
      setProfile(updatedData);
      setIsEditing(false);
    } catch (err) {
      alert(`Error updating user: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-3 container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          {/* <UserAvatar
            preview={preview}
            setPreview={setPreview}
            onUpload={(url) => setPreview(url)}
          /> */}
        </div>

        <TextField
          required
          name="fullName"
          label="Full Name"
          fullWidth
          margin="normal"
          value={userFields.fullName}
          onChange={(e) =>
            setUserFields((prev) => ({ ...prev, fullName: e.target.value }))
          }
        />

        <TextField
          name="bio"
          label="Bio"
          fullWidth
          margin="normal"
          value={userFields.bio}
          onChange={(e) =>
            setUserFields((prev) => ({ ...prev, bio: e.target.value }))
          }
        />

        <TextField
          required
          name="location"
          label="Location"
          fullWidth
          margin="normal"
          value={userFields.location}
          onChange={(e) =>
            setUserFields((prev) => ({ ...prev, location: e.target.value }))
          }
        />

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
          Update
        </Button>
      </form>
    </div>
  );
}
