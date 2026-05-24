import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_USER_ID, useProgressStore } from '@/store/progress-store';
import { useProjectStore } from '@/store/project-store';

export interface LearnerProfile {
  id: string;
  nickname: string;
  avatarId: number;
  childAge: number;
  parentEmail: string;
  registeredAt: string;
}

interface RegisterProfileInput {
  nickname: string;
  avatarId: number;
  childAge: number;
  parentEmail: string;
}

interface UserState {
  users: LearnerProfile[];
  currentUserId: string;
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
  registerFamily: (profile: RegisterProfileInput) => LearnerProfile;
  switchUser: (userId: string) => void;
  getCurrentUser: () => LearnerProfile | null;
}

function clampAge(age: number) {
  return Math.min(12, Math.max(6, Number.isFinite(age) ? age : 8));
}

function normalizeNickname(name: string) {
  return name.trim().slice(0, 12) || '小程序员';
}

function createUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function selectUserBuckets(userId: string) {
  useProgressStore.getState().selectUserProgress(userId);
  useProjectStore.getState().selectUserProjects(userId);
}

function profileToState(profile: LearnerProfile) {
  return {
    currentUserId: profile.id,
    nickname: profile.nickname,
    avatarId: profile.avatarId,
    childAge: profile.childAge,
    parentEmail: profile.parentEmail,
    registeredAt: profile.registeredAt,
    isFirstVisit: false,
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: DEFAULT_USER_ID,
      nickname: '小程序员',
      avatarId: 1,
      childAge: 8,
      parentEmail: '',
      registeredAt: null,
      isFirstVisit: true,
      completeOnboarding: () => set({ isFirstVisit: false }),
      setNickname: (name) => set({ nickname: normalizeNickname(name) }),
      setAvatar: (id) => set({ avatarId: id }),
      setChildAge: (age) => set({ childAge: clampAge(age) }),
      registerFamily: (profile) => {
        const now = new Date().toISOString();
        const learner: LearnerProfile = {
          id: createUserId(),
          nickname: normalizeNickname(profile.nickname),
          avatarId: profile.avatarId,
          childAge: clampAge(profile.childAge),
          parentEmail: profile.parentEmail.trim(),
          registeredAt: now,
        };

        set((state) => ({
          ...profileToState(learner),
          users: [learner, ...state.users.filter((user) => user.id !== learner.id)],
        }));
        selectUserBuckets(learner.id);
        return learner;
      },
      switchUser: (userId) => {
        const profile = get().users.find((user) => user.id === userId);
        if (!profile) return;
        set(profileToState(profile));
        selectUserBuckets(profile.id);
      },
      getCurrentUser: () => {
        const state = get();
        return state.users.find((user) => user.id === state.currentUserId) || null;
      },
    }),
    {
      name: 'pybuddy-user',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<UserState> | undefined;
        if (!state) return {};

        if (Array.isArray(state.users) && state.users.length > 0) {
          const currentUserId = state.currentUserId || state.users[0].id;
          const currentUser = state.users.find((user) => user.id === currentUserId) || state.users[0];
          return {
            users: state.users,
            ...profileToState(currentUser),
          };
        }

        if (state.registeredAt) {
          const legacyUser: LearnerProfile = {
            id: DEFAULT_USER_ID,
            nickname: normalizeNickname(state.nickname || '小程序员'),
            avatarId: state.avatarId || 1,
            childAge: clampAge(state.childAge || 8),
            parentEmail: state.parentEmail || '',
            registeredAt: state.registeredAt,
          };

          return {
            users: [legacyUser],
            ...profileToState(legacyUser),
          };
        }

        return {};
      },
      onRehydrateStorage: () => (state) => {
        if (state?.currentUserId) selectUserBuckets(state.currentUserId);
      },
    }
  )
);
