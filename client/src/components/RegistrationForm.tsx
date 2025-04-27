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

// const defaultAvi = '/images/AvatarDefault';

export function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'fighter' | 'promoter'>('fighter');
  const [preview, setPreview] = useState<string>('/images/AvatarDefault');
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

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        <div className="flex flex-wrap mb-1">
          <div>
            <label className="mb-1 block">
              Profile Picture
              <UserAvatar
                onUpload={(url) => setPreview(url)}
                preview={preview}
                setPreview={setPreview}
              />
            </label>
            <label className="mb-1 block">
              Username
              <input
                required
                name="username"
                type="text"
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              />
            </label>
            <label className="mb-1 block">
              Password
              <input
                required
                name="password"
                type="password"
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              />
            </label>
            <label className="mb-1 block">
              Full Name
              <input
                required
                name="fullName"
                type="text"
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              />
            </label>
            <label className="mb-1 block">
              Email
              <input
                required
                name="email"
                type="email"
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              />
            </label>
            <label className="mb-1 block">
              Bio
              <input
                required
                name="bio"
                type="text"
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              />
            </label>
            <label className="mb-1 block">
              Location
              <input
                required
                name="location"
                type="text"
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              />
            </label>
            <label className="mb-1 block">
              User Type:
              <select
                value={userType}
                onChange={handleUserTypeChange}
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2">
                <option value="fighter">Fighter</option>
                <option value="promoter">Promoter</option>
              </select>
            </label>
          </div>
        </div>
        <ConditionalFormFields
          userType={userType}
          fighterFormData={fighterFormData}
          promoterFormData={promoterFormData}
          onChange={handleChange}
        />
        <button
          disabled={isLoading}
          className="mb-2 align-middle text-center border rounded py-1 px-3 bg-blue-600 text-white">
          Sign Up
        </button>
      </form>
      <Link to="/auth/sign-in" className="ml-2">
        Sign In
      </Link>
    </div>
  );
}
