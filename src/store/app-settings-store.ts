import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FontScale = 'normal' | 'large' | 'extra';
type ColorMode = 'bright' | 'eye-care' | 'contrast' | 'dark';

interface AppSettingsState {
  fontScale: FontScale;
  colorMode: ColorMode;
  narrationEnabled: boolean;
  soundEffectsEnabled: boolean;
  reducedMotion: boolean;
  setFontScale: (fontScale: FontScale) => void;
  setColorMode: (colorMode: ColorMode) => void;
  toggleNarration: () => void;
  toggleSoundEffects: () => void;
  toggleReducedMotion: () => void;
}

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      fontScale: 'normal',
      colorMode: 'bright',
      narrationEnabled: true,
      soundEffectsEnabled: true,
      reducedMotion: false,
      setFontScale: (fontScale) => set({ fontScale }),
      setColorMode: (colorMode) => set({ colorMode }),
      toggleNarration: () => set((state) => ({ narrationEnabled: !state.narrationEnabled })),
      toggleSoundEffects: () => set((state) => ({ soundEffectsEnabled: !state.soundEffectsEnabled })),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
    }),
    { name: 'pybuddy-app-settings', version: 1 }
  )
);
