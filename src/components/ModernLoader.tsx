import React from 'react';

interface ModernLoaderProps {
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  variant?: 'primary' | 'black' | 'white';
}

const sizeToPx: Record<'sm' | 'md' | 'lg', number> = {
  sm: 24,
  md: 40,
  lg: 64,
};

const ModernLoader: React.FC<ModernLoaderProps> = ({
  size = 'md',
  className = '',
  variant = 'primary',
}) => {
  const px = typeof size === 'number' ? size : sizeToPx[size];
  const radius = px * 0.35;
  const strokeWidth = Math.max(3, px * 0.1); // Thicker strokes for brutalist style

  // Brutalist color scheme
  const colors = {
    primary: '#d81313', // App's primary red
    black: '#000000',
    white: '#ffffff',
  };

  const color = colors[variant];

  return (
    <div role="status" aria-label="Loading" className={className}>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="animate-spin"
        style={{
          filter: 'drop-shadow(2px 2px 0px #000000)', // Brutalist shadow
        }}
      >
        {/* Background circle with black border */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke="#000000"
          strokeWidth={strokeWidth + 1}
          strokeLinecap="square" // Sharp, brutalist line caps
        />

        {/* Animated loading arc */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="square"
          strokeDasharray={`${radius * 2 * Math.PI * 0.3} ${radius * 2 * Math.PI * 0.7}`}
          strokeDashoffset={0}
          className="opacity-100"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default ModernLoader;
