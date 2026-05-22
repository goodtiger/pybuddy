import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  nickname: string;
  avatarId: number;
  childAge: number;
  parentEmail: string;
  registeredAt: string | null;
  isFirstVisit: boolean;
  completeOnboarding: () => void;
  setNickname: (name: string) => void;
  setAvatar: (id: number) => void;
  setChildAge: (age: number) => void;
  registerFamily: (profile: { nickname: string; avatarId: number; childAge: number; parentEmail: string }) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: '小程序员',
      avatarId: 1,
      childAge: 8,
      parentEmail: '',
      registeredAt: null,
      isFirstVisit: true,
      completeOnboarding: () => set({ isFirstVisit: false }),
      setNickname: (name) => set({ nickname: name }),
      setAvatar: (id) => set({ avatarId: id }),
      setChildAge: (age) => set({ childAge: Math.min(12, Math.max(6, age)) }),
      registerFamily: (profile) =>
        set({
          nickname: profile.nickname.trim() || '小程序员',
          avatarId: profile.avatarId,
          childAge: Math.min(12, Math.max(6, profile.childAge)),
          parentEmail: profile.parentEmail.trim(),
          registeredAt: new Date().toISOString(),
          isFirstVisit: false,
        }),
    }),
    { name: 'pybuddy-user', version: 1 }
  )
);
