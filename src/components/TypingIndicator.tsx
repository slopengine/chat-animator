import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeColors } from '../types';

interface TypingIndicatorProps {
  theme: ThemeColors;
  startFrame: number;
  endFrame: number;
  senderName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  theme,
  startFrame,
  endFrame,
  senderName,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Don't render if outside the typing window
  if (frame < startFrame || frame >= endFrame) {
    return null;
  }

  const relativeFrame = frame - startFrame;

  // No fade - just appear and disappear instantly
  const opacity = 1;

  // Animated dots - bounce animation
  const dotAnimationDuration = fps * 0.3; // 300ms per dot cycle
  const animationProgress = (relativeFrame % (dotAnimationDuration * 3)) / dotAnimationDuration;

  const getDotOpacity = (dotIndex: number) => {
    const phase = animationProgress - dotIndex * 0.33;
    if (phase < 0 || phase > 1) return 0.4;
    return interpolate(phase, [0, 0.5, 1], [0.4, 1, 0.4]);
  };

  const getDotTranslateY = (dotIndex: number) => {
    const phase = animationProgress - dotIndex * 0.33;
    if (phase < 0 || phase > 1) return 0;
    return interpolate(phase, [0, 0.5, 1], [0, -6, 0]);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 12,
    paddingRight: 120,
    opacity: opacity,
  };

  const bubbleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 26px',
    borderRadius: '16px 16px 16px 0px',
    backgroundColor: theme.receivedBubble,
    boxShadow: '0 2px 1px rgba(11, 20, 26, 0.13)',
  };

  const dotStyle = (index: number): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: theme.typingIndicator,
    opacity: getDotOpacity(index),
    transform: `translateY(${getDotTranslateY(index)}px)`,
    transition: 'none',
  });

  return (
    <div style={containerStyle}>
      <div style={bubbleStyle}>
        <div style={dotStyle(0)} />
        <div style={dotStyle(1)} />
        <div style={dotStyle(2)} />
      </div>
    </div>
  );
};
