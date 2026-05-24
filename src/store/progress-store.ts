import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getLessonCountForLevel,
  normalizeProgressLessonKey,
  parseProgressLessonKey,
} from '@/lib/courses/course-constants';

export const DEFAULT_USER_ID = 'guest';

interface ProgressData {
  completedLessons: string[];
  lessonStars: Record<string, number>;
  currentLevel: number;
  currentLesson: number;
  streakDays: number;
  totalStars: number;
}

interface ProgressState extends ProgressData {
  activeUserId: string;
  progressByUser: Record<string, ProgressData>;
  selectUserProgress: (userId: string) => void;
  completeLesson: (lessonId: string, stars: number) => void;
  setCurrentLesson: (number: number, level: number) => void;
  reset: () => void;
}

function emptyProgress(): ProgressData {
  return {
    completedLessons: [],
    lessonStars: {},
    currentLevel: 1,
    currentLesson: 1,
    streakDays: 0,
    totalStars: 0,
  };
}

function normalizeProgress(progress: Partial<ProgressData> | undefined): ProgressData {
  const fallback = emptyProgress();
  const currentLevel = progress?.currentLevel;
  const currentLesson = progress?.currentLesson;
  const streakDays = progress?.streakDays;
  const totalStars = progress?.totalStars;
  const completedLessons = Array.isArray(progress?.completedLessons)
    ? Array.from(new Set(progress.completedLessons.map(normalizeProgressLessonKey)))
    : fallback.completedLessons;
  const lessonStars =
    progress?.lessonStars && typeof progress.lessonStars === 'object'
      ? Object.entries(progress.lessonStars).reduce<Record<string, number>>((stars, [key, value]) => {
          stars[normalizeProgressLessonKey(key)] = value;
          return stars;
        }, {})
      : fallback.lessonStars;

  return {
    completedLessons,
    lessonStars,
    currentLevel: typeof currentLevel === 'number' && Number.isInteger(currentLevel) ? currentLevel : fallback.currentLevel,
    currentLesson: typeof currentLesson === 'number' && Number.isInteger(currentLesson) ? currentLesson : fallback.currentLesson,
    streakDays: typeof streakDays === 'number' && Number.isInteger(streakDays) ? streakDays : fallback.streakDays,
    totalStars: typeof totalStars === 'number' && Number.isInteger(totalStars) ? totalStars : fallback.totalStars,
  };
}

function activeSnapshot(state: ProgressState) {
  return normalizeProgress(state.progressByUser[state.activeUserId]);
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...emptyProgress(),
      activeUserId: DEFAULT_USER_ID,
      progressByUser: { [DEFAULT_USER_ID]: emptyProgress() },
      selectUserProgress: (userId) =>
        set((state) => {
          const nextProgressByUser = {
            ...state.progressByUser,
            [state.activeUserId]: normalizeProgress({
              completedLessons: state.completedLessons,
              lessonStars: state.lessonStars,
              currentLevel: state.currentLevel,
              currentLesson: state.currentLesson,
              streakDays: state.streakDays,
              totalStars: state.totalStars,
            }),
          };
          const selected = normalizeProgress(nextProgressByUser[userId]);
          return {
            ...selected,
            activeUserId: userId,
            progressByUser: {
              ...nextProgressByUser,
              [userId]: selected,
            },
          };
        }),
      completeLesson: (lessonId, stars) =>
        set((state) => {
          const progress = activeSnapshot(state);
          const { level, lessonId: normalizedLessonId } = parseProgressLessonKey(lessonId);
          const lessonNumber = Number(normalizedLessonId.split('_')[1] || 0);
          const previousStars = progress.lessonStars[lessonId] || 0;
          const nextLesson =
            level === progress.currentLevel && lessonNumber < progress.currentLesson
              ? progress.currentLesson
              : Math.min(lessonNumber + 1, getLessonCountForLevel(level));

          const nextProgress = {
            completedLessons: progress.completedLessons.includes(lessonId)
              ? progress.completedLessons
              : [...progress.completedLessons, lessonId],
            lessonStars: { ...progress.lessonStars, [lessonId]: Math.max(previousStars, stars) },
            currentLesson: nextLesson,
            currentLevel: level,
            streakDays: Math.max(progress.streakDays, 1),
            totalStars: progress.totalStars + Math.max(0, stars - previousStars),
          };

          return {
            ...nextProgress,
            progressByUser: {
              ...state.progressByUser,
              [state.activeUserId]: nextProgress,
            },
          };
        }),
      setCurrentLesson: (number, level) =>
        set((state) => {
          const nextProgress = { ...activeSnapshot(state), currentLesson: number, currentLevel: level };
          return {
            ...nextProgress,
            progressByUser: {
              ...state.progressByUser,
              [state.activeUserId]: nextProgress,
            },
          };
        }),
      reset: () =>
        set((state) => {
          const nextProgress = emptyProgress();
          return {
            ...nextProgress,
            progressByUser: {
              ...state.progressByUser,
              [state.activeUserId]: nextProgress,
            },
          };
        }),
    }),
    {
      name: 'pybuddy-progress',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<ProgressState> | undefined;
        const activeUserId = state?.activeUserId || DEFAULT_USER_ID;
        const legacyProgress = normalizeProgress(state);
        const progressByUser = state?.progressByUser || { [activeUserId]: legacyProgress };
        const activeProgress = normalizeProgress(progressByUser[activeUserId] || legacyProgress);

        return {
          ...activeProgress,
          activeUserId,
          progressByUser: {
            ...progressByUser,
            [activeUserId]: activeProgress,
          },
        };
      },
    }
  )
);
