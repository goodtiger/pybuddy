'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Sk: any;
  }
}

let isLoading = false;
let isLoaded = false;

export function useSkulpt() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      setLoaded(true);
      return;
    }
    if (isLoading) return;
    isLoading = true;

    const loadSkulpt = async () => {
      try {
        const skulptScript = document.createElement('script');
        skulptScript.src = '/vendor/skulpt/skulpt.min.js';
        skulptScript.async = true;
        skulptScript.onload = () => {
          const stdlibScript = document.createElement('script');
          stdlibScript.src = '/vendor/skulpt/skulpt-stdlib.js';
          stdlibScript.async = true;
          stdlibScript.onload = () => {
            isLoaded = true;
            isLoading = false;
            setLoaded(true);
          };
          stdlibScript.onerror = () => { setError('无法加载Python标准库'); isLoading = false; };
          document.head.appendChild(stdlibScript);
        };
        skulptScript.onerror = () => { setError('无法加载Python引擎'); isLoading = false; };
        document.head.appendChild(skulptScript);
      } catch {
        setError('加载Python引擎失败');
        isLoading = false;
      }
    };
    loadSkulpt();
  }, []);

  return { loaded, error };
}
