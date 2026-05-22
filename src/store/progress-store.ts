import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  completedLessons: string[];
  lessonStars: Record<string, number>;
  currentLevel: number;
  currentLesson: number;
  streakDays: number;
  totalStars: number;
  completeLesson: (lessonId: string, stars: number) => void;
  setCurrentLesson: (number: number, level: number) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedLessons: [],
      lessonStars: {},
      currentLevel: 1,
      currentLesson: 1,
      streakDays: 0,
      totalStars: 0,
      completeLesson: (lessonId, stars) =>
        set((state) => {
          const lessonNumber = Number(lessonId.split('_')[1] || 0);
          const previousStars = state.lessonStars[lessonId] || 0;
          const nextLesson = lessonNumber >= state.currentLesson ? Math.min(lessonNumber + 1, 15) : state.currentLesson;

          return {
            completedLessons: state.completedLessons.includes(lessonId)
              ? state.completedLessons
              : [...state.completedLessons, lessonId],
            lessonStars: { ...state.lessonStars, [lessonId]: Math.max(previousStars, stars) },
            currentLesson: nextLesson,
            streakDays: Math.max(state.streakDays, 1),
            totalStars: state.totalStars + Math.max(0, stars - previousStars),
          };
        }),
      setCurrentLesson: (number, level) => set({ currentLesson: number, currentLevel: level }),
      reset: () =>
        set({ completedLessons: [], lessonStars: {}, currentLevel: 1, currentLesson: 1, streakDays: 0, totalStars: 0 }),
    }),
    {
      name: 'pybuddy-progress',
      version: 1,
    }
  )
);
