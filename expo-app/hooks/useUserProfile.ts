import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Gender, ActivityLevel, DietGoal } from '../utils/bmr';

export type UserProfile = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal?: string;
  targetBodyFat?: number;
  targetKcal?: number;
  dietGoal?: DietGoal;
  trainingType?: string;
  trainingYears?: string;
  bmr?: number;
};

const STORAGE_KEY = 'godhand_user_profile';

const defaultProfile: UserProfile = {
  gender: 'male',
  age: 25,
  heightCm: 175,
  weightKg: 70,
  activityLevel: 'light',
};

export async function loadProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export default function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const loaded = await loadProfile();
      setProfile(loaded ?? defaultProfile);
      setIsReady(true);
    })();
  }, []);

  const updateProfile = useCallback(async (next: UserProfile) => {
    setProfile(next);
    await saveProfile(next);
  }, []);

  return { profile, isReady, updateProfile, defaultProfile };
}
