import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ThemeColors } from '../types';

interface DateSeparatorProps {
  date: string;
  theme: ThemeColors;
  appearFrame: number;
}

/**
 * Date separator pill shown between messages on different days.
 * Matches the WhatsApp design with centered rounded pill.
 */
export const DateSeparator: React.FC<DateSeparatorProps> = ({
  date,
  theme,
  appearFrame,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - appearFrame;

  if (relativeFrame < 0) {
    return null;
  }

  // No animation - just appear instantly
  const opacity = 1;
  const scale = 1;

  // Scale factor: 1080/375 = 2.88
  const SCALE = 2.88;
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20 * SCALE,
        paddingBottom: 4 * SCALE,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          backgroundColor: theme.dateSeparatorBg,
          color: theme.dateSeparatorText,
          fontSize: 12.5 * SCALE, // ~36px
          fontWeight: 500,
          padding: `${6 * SCALE}px ${12 * SCALE}px`,
          borderRadius: 8 * SCALE,
          boxShadow: '0 1px 1px rgba(11, 20, 26, 0.13)',
          textTransform: 'uppercase',
          letterSpacing: 0.2,
        }}
      >
        {date}
      </div>
    </div>
  );
};
