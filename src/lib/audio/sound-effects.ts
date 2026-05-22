'use client';

import { useAppSettingsStore } from '@/store/app-settings-store';

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  if (!audioCtx) return;
  if (!useAppSettingsStore.getState().soundEffectsEnabled) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
}

export function playBlockSnap() {
  playTone(800, 0.08, 'square');
}

export function playSuccess() {
  playTone(523, 0.15);
  setTimeout(() => playTone(659, 0.15), 150);
  setTimeout(() => playTone(784, 0.2), 300);
}

export function playError() {
  playTone(200, 0.3, 'sawtooth');
}

export function playClick() {
  playTone(600, 0.05, 'sine');
}
