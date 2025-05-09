import { useEffect, ReactNode, createContext, useState } from 'react';
import { readUser, readToken, removeAuth, saveAuth } from '../lib/data';
import { Profile } from '../pages/UserProfile';

export function isFighterUser(profile: Profile): profile is FighterUser {
  return profile.userType === 'fighter' && 'weight' in profile;
}

export function isPromoterUser(profile: Profile): profile is PromoterUser {
  return profile.userType === 'promoter';
}

export type User = {
  userId: number;
  username: string;
  password: string;
  profilePictureUrl?: string;
  fullName: string;
  email: string;
  bio?: string;
  location: string;
  userType: 'fighter' | 'promoter';
};

export type FighterUser = User & {
  weight: number;
  height: string;
  record: string;
  gymName?: string;
  pullouts: number;
  weightMisses: number;
  finishes: number;
};

export type PromoterUser = User & {
  promotion: string;
  promoter: string;
  nextEvent?: Date;
};

export type UserContextValues = {
  user: User | undefined;
  token: string | undefined;
  handleSignIn: (user: User, token: string) => void;
  handleSignOut: () => void;
};

export const UserContext = createContext<UserContextValues>({
  user: undefined,
  token: undefined,
  handleSignIn: () => undefined,
  handleSignOut: () => undefined,
});

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props) {
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    const savedUser = readUser();
    const savedToken = readToken();
    if (savedUser) {
      setUser(savedUser);
    }
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  function handleSignIn(user: User, token: string) {
    console.log('can you see this:', user);
    setUser(user);
    setToken(token);
    saveAuth(user, token);
  }
  function handleSignOut() {
    setUser(undefined);
    setToken(undefined);
    removeAuth();
  }
  const contextValue = { user, token, handleSignIn, handleSignOut };
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
