import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ParentSettingsState {
  dailyTimeLimit: number;
  weeklyReportEnabled: boolean;
  achievementAlertsEnabled: boolean;
  subscription: 'free' | 'family' | 'education';
  setDailyTimeLimit: (minutes: number) => void;
  toggleWeeklyReport: () => void;
  toggleAchievementAlerts: () => void;
  setSubscription: (subscription: 'free' | 'family' | 'education') => void;
}

export const useParentSettingsStore = create<ParentSettingsState>()(
  persist(
    (set) => ({
      dailyTimeLimit: 30,
      weeklyReportEnabled: true,
      achievementAlertsEnabled: true,
      subscription: 'free',
      setDailyTimeLimit: (minutes) => set({ dailyTimeLimit: Math.min(90, Math.max(5, minutes)) }),
      toggleWeeklyReport: () => set((state) => ({ weeklyReportEnabled: !state.weeklyReportEnabled })),
      toggleAchievementAlerts: () => set((state) => ({ achievementAlertsEnabled: !state.achievementAlertsEnabled })),
      setSubscription: (subscription) => set({ subscription }),
    }),
    { name: 'pybuddy-parent-settings', version: 1 }
  )
);
