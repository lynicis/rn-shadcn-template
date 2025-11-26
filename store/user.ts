import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

type UserStoreState = {
  session: Session | null;
  user: User | null;
};

type UserStoreActions = {
  isUserAuthenticated: () => boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

type UserStore = UserStoreState & UserStoreActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isUserAuthenticated: () => Boolean(get().session) && Boolean(get().user),
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      clearUser: () => set({ session: null, user: null }),
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
