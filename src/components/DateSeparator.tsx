import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
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
  const { fps } = useVideoConfig();
  const relativeFrame = frame - appearFrame;

  if (relativeFrame < 0) {
    return null;
  }

  const scaleProgress = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const opacity = interpolate(relativeFrame, [0, 5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(scaleProgress, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 0',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          backgroundColor: theme.dateSeparatorBg,
          color: theme.dateSeparatorText,
          fontSize: 24,
          fontWeight: 400,
          padding: '8px 24px',
          borderRadius: 16,
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
