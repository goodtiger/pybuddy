import { create } from 'zustand';
import type { Lesson, Phase } from '@/types/lesson';
import type { RunResult, TutorMessage } from '@/types/runtime';

interface LessonState {
  currentLesson: Lesson | null;
  phase: Phase;
  blockXml: string;
  pythonCode: string;
  isRunning: boolean;
  lastResult: RunResult | null;
  hasError: boolean;
  hints: string[];
  currentHintIndex: number;
  aiMessages: TutorMessage[];
  aiDailyQuota: number;
  setCurrentLesson: (lesson: Lesson) => void;
  setPhase: (phase: Phase) => void;
  setBlocklyXml: (xml: string) => void;
  setPythonCode: (code: string) => void;
  setRunning: (running: boolean) => void;
  setRunResult: (result: RunResult) => void;
  nextHint: () => void;
  addAiMessage: (msg: TutorMessage) => void;
  decrementAiQuota: () => void;
  reset: () => void;
}

export const useLessonStore = create<LessonState>()((set) => ({
  currentLesson: null,
  phase: 'block',
  blockXml: '',
  pythonCode: '',
  isRunning: false,
  lastResult: null,
  hasError: false,
  hints: [],
  currentHintIndex: 0,
  aiMessages: [],
  aiDailyQuota: 5,
  setCurrentLesson: (lesson) =>
    set({ currentLesson: lesson, phase: lesson.phase, blockXml: '', pythonCode: lesson.expected_code || '', hints: lesson.hints, currentHintIndex: 0, hasError: false, lastResult: null }),
  setPhase: (phase) => set({ phase }),
  setBlocklyXml: (xml) => set({ blockXml: xml }),
  setPythonCode: (code) => set({ pythonCode: code }),
  setRunning: (running) => set({ isRunning: running }),
  setRunResult: (result) => set({ lastResult: result, hasError: result.error !== null }),
  nextHint: () => set((state) => ({ currentHintIndex: Math.min(state.currentHintIndex + 1, state.hints.length - 1) })),
  addAiMessage: (msg) => set((state) => ({ aiMessages: [...state.aiMessages, msg] })),
  decrementAiQuota: () => set((state) => ({ aiDailyQuota: Math.max(0, state.aiDailyQuota - 1) })),
  reset: () => set((state) => ({
    blockXml: '',
    pythonCode: state.currentLesson?.expected_code || '',
    hasError: false,
    lastResult: null,
    isRunning: false,
    currentHintIndex: 0,
  })),
}));
