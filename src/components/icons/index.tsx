'use client';

export function TurtleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="14" rx="7" ry="5" fill="#22C55E" />
      <circle cx="12" cy="14" r="4" fill="#16A34A" />
      <circle cx="8" cy="10" r="2" fill="#22C55E" />
      <circle cx="16" cy="10" r="2" fill="#22C55E" />
      <circle cx="12" cy="8" r="1.5" fill="#22C55E" />
      <circle cx="11.5" cy="7.5" r="0.4" fill="#1F2937" />
      <circle cx="12.5" cy="7.5" r="0.4" fill="#1F2937" />
      <path d="M6 16L4 18M18 16L20 18" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ className = 'w-6 h-6', filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? '#F59E0B' : 'none'} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.4 15C19.27 15.34 19.27 15.72 19.4 16.06L20.74 18.24C20.85 18.42 20.85 18.65 20.74 18.83L19.5 21C19.39 21.18 19.18 21.27 19 21.21L16.5 20.38C16.15 20.26 15.77 20.26 15.43 20.38C15.1 20.5 14.84 20.74 14.7 21.05L14 23.5C13.95 23.7 13.77 23.84 13.56 23.84H11.08C10.88 23.84 10.7 23.7 10.65 23.5L10 21.05C9.84 20.74 9.58 20.5 9.25 20.38C8.92 20.26 8.54 20.26 8.2 20.38L5.7 21.21C5.51 21.27 5.3 21.18 5.2 21L4 18.83C3.88 18.65 3.88 18.42 4 18.24L5.34 16.06C5.47 15.72 5.47 15.34 5.34 15C5.21 14.66 4.95 14.42 4.62 14.3L2.17 13.5C1.98 13.44 1.83 13.27 1.83 13.06V10.58C1.83 10.38 1.98 10.21 2.17 10.15L4.62 9.32C4.95 9.2 5.21 8.96 5.34 8.62C5.47 8.28 5.47 7.9 5.34 7.56L4 5.38C3.88 5.2 3.88 4.97 4 4.79L5.24 2.66C5.35 2.48 5.56 2.39 5.74 2.45L8.24 3.28C8.58 3.4 8.96 3.4 9.3 3.28C9.63 3.16 9.89 2.92 10.04 2.61L10.7 0.16C10.75 -0.04 10.93 -0.18 11.14 -0.18H13.62C13.82 -0.18 14 -0.04 14.05 0.16L14.7 2.61C14.85 2.92 15.11 3.16 15.44 3.28C15.77 3.4 16.15 3.4 16.49 3.28L19 2.45C19.18 2.39 19.39 2.48 19.5 2.66L20.74 4.79C20.85 4.97 20.85 5.2 20.74 5.38L19.4 7.56C19.27 7.9 19.27 8.28 19.4 8.62C19.53 8.96 19.79 9.2 20.12 9.32L22.57 10.15C22.76 10.21 22.91 10.38 22.91 10.58V13.06C22.91 13.27 22.76 13.44 22.57 13.5L20.12 14.32C19.79 14.42 19.53 14.66 19.4 15Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function FireIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C16.42 22 20 18.42 20 14C20 8 12 2 12 2C12 2 4 8 4 14C4 18.42 7.58 22 12 22Z" fill="#EF4444" />
      <path d="M12 22C14.21 22 16 20.21 16 18C16 14 12 10 12 10C12 10 8 14 8 18C8 20.21 9.79 22 12 22Z" fill="#F59E0B" />
    </svg>
  );
}

export function CheckIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LightbulbIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.69 2 6 4.69 6 8C6 10.42 7.42 12.5 9.47 13.43C9.18 14.13 9 14.89 9 15.5C9 17.99 10.5 20 12 20C13.5 20 15 17.99 15 15.5C15 14.89 14.82 14.13 14.53 13.43C16.58 12.5 18 10.42 18 8C18 4.69 15.31 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 22H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShareIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 6.66 16.34 8 18 8ZM6 15C7.66 15 9 13.66 9 12C9 10.34 7.66 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15ZM18 22C19.66 22 21 20.66 21 19C21 17.34 19.66 16 18 16C16.34 16 15 17.34 15 19C15 20.66 16.34 22 18 22ZM8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrophyIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9H4C3.45 9 3 8.55 3 8V6C3 5.45 3.45 5 4 5H6M18 9H20C20.55 9 21 8.55 21 8V6C21 5.45 20.55 5 20 5H18M6 5H18V11C18 14.31 15.31 17 12 17C8.69 17 6 14.31 6 11V5ZM9 20H15M12 17V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function MapPinIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21C15.5 17.4 19 14.08 19 10C19 5.58 15.87 2 12 2C8.13 2 5 5.58 5 10C5 14.08 8.5 17.4 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CodeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6L2 12L8 18M16 6L22 12L16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FolderIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3H9L11 6H20C21.1 6 22 6.9 22 8V19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChartIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
