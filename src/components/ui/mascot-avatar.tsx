const TURTLE_EXPRESSIONS: Record<string, string> = {
  happy: '🐢',
  confused: '😕',
  celebrating: '🎉',
  running: '🏃',
  default: '🐢',
};

interface MascotAvatarProps {
  expression?: 'happy' | 'confused' | 'celebrating' | 'running' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = { sm: 'text-3xl', md: 'text-5xl', lg: 'text-7xl', xl: 'text-9xl' };

export function MascotAvatar({ expression = 'happy', size = 'lg', className = '' }: MascotAvatarProps) {
  return (
    <span className={`${sizeMap[size]} ${className}`} role="img" aria-label="turtle mascot">
      {TURTLE_EXPRESSIONS[expression]}
    </span>
  );
}
