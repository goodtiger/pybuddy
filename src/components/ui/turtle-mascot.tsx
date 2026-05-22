'use client';

import { motion } from 'framer-motion';

interface TurtleMascotProps {
  expression?: 'happy' | 'confused' | 'celebrating' | 'running' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const sizeMap = { sm: 48, md: 64, lg: 96, xl: 128 };
const imageMap: Record<string, string> = {
  happy: '/assets/mascot/turtle-happy.png',
  default: '/assets/mascot/turtle-happy.png',
  confused: '/assets/mascot/turtle-confused.png',
  celebrating: '/assets/mascot/turtle-celebrating.png',
  running: '/assets/mascot/turtle-running.png',
};

export function TurtleMascot({ expression = 'happy', size = 'lg', className = '', animate = true }: TurtleMascotProps) {
  const pixelSize = sizeMap[size];
  const src = imageMap[expression] || imageMap.default;

  return (
    <div className={`relative ${className}`}>
      {animate ? (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src={src} alt="turtle mascot" width={pixelSize} height={pixelSize} className="object-contain turtle-mascot-enhanced" />
        </motion.div>
      ) : (
        <img src={src} alt="turtle mascot" width={pixelSize} height={pixelSize} className="object-contain turtle-mascot-enhanced" />
      )}
    </div>
  );
}

