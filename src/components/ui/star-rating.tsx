interface StarRatingProps {
  count: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizeMap = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };

export function StarRating({ count, max = 3, size = 'md', animated = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`${sizeMap[size]} ${i < count ? 'text-accent' : 'text-gray-300'} ${animated ? 'animate-bounce-in' : ''}`}
          style={animated ? { animationDelay: `${i * 200}ms`, animationFillMode: 'both' } : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}
