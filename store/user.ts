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

export const useUserStore = create<UserStore>((set, get) => ({
  session: null,
  user: null,
  isUserAuthenticated: () => Boolean(get().session) && Boolean(get().user),
  setSession: (session) => set((state) => ({ ...state, session })),
  setUser: (user) => set((state) => ({ ...state, user })),
  clearUser: () => set((state) => ({ ...state, session: null, user: null })),
}));
