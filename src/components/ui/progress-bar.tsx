interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`w-full bg-gray-200 rounded-kid-full h-3 overflow-hidden ${className}`}>
      <div
        className="h-full bg-secondary rounded-kid-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
