import React from 'react';
import styles from './MorphingFarmLoader.module.css';

interface MorphingFarmLoaderProps {
  size?: 'sm' | 'md' | 'lg' | number; // tailwind sizes or explicit px
  className?: string;
  durationMs?: number; // full cycle duration
}

const sizeToPx: Record<'sm' | 'md' | 'lg', number> = {
  sm: 48,
  md: 72,
  lg: 112,
};

const MorphingFarmLoader: React.FC<MorphingFarmLoaderProps> = ({
  size = 'md',
  className = '',
  durationMs = 3600,
}) => {
  const px = typeof size === 'number' ? size : sizeToPx[size];
  const dur = Math.max(1200, durationMs); // keep reasonable minimum

  return (
    <div role="status" aria-label="Loading" className={className}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 128 128"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={
          {
            '--spin-duration': `${dur / 1200}s`,
            '--cycle-duration': `${dur}ms`,
            '--blink-duration': `${Math.max(1800, dur / 2)}ms`,
            '--bob-duration': `${dur / 6}ms`,
            '--pulse-duration': `${dur / 4}ms`,
          } as React.CSSProperties
        }
      >
        {/* Outer rotating ring for "loading" affordance */}
        <g className={styles.ring}>
          <circle
            cx="64"
            cy="64"
            r="52"
            fill="none"
            stroke="#EAEAEA"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle
            cx="64"
            cy="64"
            r="52"
            fill="none"
            stroke="#B1E3FF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="40 290"
            strokeDashoffset="0"
          />
        </g>

        {/* Soft glow behind face */}
        <g className={styles.pulse}>
          <circle cx="64" cy="64" r="34" fill="#F3F4F680" />
        </g>

        {/* Pig Phase */}
        <g className={`${styles.phase} ${styles.pig} ${styles.bob}`}>
          {/* head */}
          <ellipse
            cx="64"
            cy="64"
            rx="30"
            ry="26"
            fill="#FFD1DC"
            stroke="#F48CA3"
            strokeWidth="4"
          />
          {/* ears */}
          <path
            d="M40 44 C36 36, 44 36, 46 46"
            fill="#FFD1DC"
            stroke="#F48CA3"
            strokeWidth="4"
          />
          <path
            d="M88 44 C92 36, 84 36, 82 46"
            fill="#FFD1DC"
            stroke="#F48CA3"
            strokeWidth="4"
          />
          {/* snout */}
          <ellipse
            cx="64"
            cy="76"
            rx="14"
            ry="9"
            fill="#FFC0CB"
            stroke="#F48CA3"
            strokeWidth="3"
          />
          <circle cx="58" cy="76" r="2" fill="#F48CA3" />
          <circle cx="70" cy="76" r="2" fill="#F48CA3" />
          {/* eyes */}
          <circle className={styles.blinkL} cx="54" cy="60" r="2" fill="#333" />
          <circle className={styles.blinkR} cx="74" cy="60" r="2" fill="#333" />
          {/* blush */}
          <circle cx="48" cy="70" r="3" fill="#F9A8D4" opacity="0.75" />
          <circle cx="80" cy="70" r="3" fill="#F9A8D4" opacity="0.75" />
        </g>

        {/* Cow Phase */}
        <g className={`${styles.phase} ${styles.cow} ${styles.bob}`}>
          {/* head */}
          <ellipse
            cx="64"
            cy="64"
            rx="31"
            ry="27"
            fill="#FFF"
            stroke="#BDBDBD"
            strokeWidth="4"
          />
          {/* ears */}
          <path
            d="M42 44 C34 40, 44 34, 49 44"
            fill="#EDEDED"
            stroke="#BDBDBD"
            strokeWidth="4"
          />
          <path
            d="M86 44 C94 40, 84 34, 79 44"
            fill="#EDEDED"
            stroke="#BDBDBD"
            strokeWidth="4"
          />
          {/* horns */}
          <path
            d="M52 38 C50 32, 56 30, 58 36"
            fill="none"
            stroke="#BDBDBD"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M76 38 C78 32, 72 30, 70 36"
            fill="none"
            stroke="#BDBDBD"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* snout */}
          <rect
            x="52"
            y="72"
            width="24"
            height="12"
            rx="6"
            fill="#FFD7A8"
            stroke="#E2B48D"
            strokeWidth="3"
          />
          <circle cx="60" cy="78" r="2" fill="#9A7758" />
          <circle cx="68" cy="78" r="2" fill="#9A7758" />
          {/* eyes */}
          <circle className={styles.blinkL} cx="54" cy="60" r="2" fill="#333" />
          <circle className={styles.blinkR} cx="74" cy="60" r="2" fill="#333" />
          {/* spots */}
          <path
            d="M76 56 C86 58, 86 70, 74 68 C70 64, 72 54, 76 56 Z"
            fill="#2B2B2B"
            opacity="0.85"
          />
          <path
            d="M52 66 C58 66, 58 72, 50 74 C48 70, 48 66, 52 66 Z"
            fill="#2B2B2B"
            opacity="0.75"
          />
        </g>

        {/* Sheep Phase */}
        <g className={`${styles.phase} ${styles.sheep} ${styles.bob}`}>
          {/* fluffy head */}
          <ellipse
            cx="64"
            cy="64"
            rx="28"
            ry="24"
            fill="#FFF8F0"
            stroke="#E6D8C3"
            strokeWidth="4"
          />
          {/* wool cloud */}
          <g fill="#FFF8F0" stroke="#E6D8C3" strokeWidth="3">
            <circle cx="48" cy="44" r="8" />
            <circle cx="60" cy="40" r="9" />
            <circle cx="72" cy="40" r="9" />
            <circle cx="84" cy="44" r="8" />
          </g>
          {/* ears */}
          <path
            d="M44 50 C36 50, 40 58, 46 56"
            fill="#FFF1E2"
            stroke="#E6D8C3"
            strokeWidth="4"
          />
          <path
            d="M84 50 C92 50, 88 58, 82 56"
            fill="#FFF1E2"
            stroke="#E6D8C3"
            strokeWidth="4"
          />
          {/* muzzle */}
          <ellipse
            cx="64"
            cy="76"
            rx="12"
            ry="8"
            fill="#F3E5D0"
            stroke="#E6D8C3"
            strokeWidth="3"
          />
          <circle cx="60" cy="76" r="2" fill="#B79F83" />
          <circle cx="68" cy="76" r="2" fill="#B79F83" />
          {/* eyes */}
          <circle className={styles.blinkL} cx="54" cy="60" r="2" fill="#333" />
          <circle className={styles.blinkR} cx="74" cy="60" r="2" fill="#333" />
        </g>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default MorphingFarmLoader;
