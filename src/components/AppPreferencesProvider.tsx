'use client';

import { useEffect } from 'react';
import { useAppSettingsStore } from '@/store/app-settings-store';

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { fontScale, colorMode, reducedMotion } = useAppSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontScale = fontScale;
    root.dataset.colorMode = colorMode;
    root.dataset.reducedMotion = String(reducedMotion);
    root.dataset.theme = colorMode === 'dark' ? 'dark' : 'light';
  }, [fontScale, colorMode, reducedMotion]);

  return <>{children}</>;
}
