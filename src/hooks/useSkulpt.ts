'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Sk: any;
  }
}

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

function appendScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      if (src.includes('skulpt.min.js') && window.Sk) {
        existing.dataset.loaded = 'true';
        resolve();
        return;
      }
      if (src.includes('skulpt-stdlib.js') && window.Sk?.builtinFiles) {
        existing.dataset.loaded = 'true';
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export function useSkulpt() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.Sk?.builtinFiles) {
      isLoaded = true;
      setLoaded(true);
      return;
    }

    if (isLoaded) {
      setLoaded(true);
      return;
    }
    if (!loadPromise) {
      isLoading = true;
      loadPromise = (async () => {
        await appendScript('/vendor/skulpt/skulpt.min.js');
        await appendScript('/vendor/skulpt/skulpt-stdlib.js');
        isLoaded = true;
        isLoading = false;
      })();
    }

    let cancelled = false;
    const loadSkulpt = async () => {
      try {
        await loadPromise;
        if (!cancelled) setLoaded(true);
      } catch {
        isLoading = false;
        loadPromise = null;
        if (!cancelled) setError('加载Python引擎失败');
      }
    };
    loadSkulpt();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loaded, error };
}
