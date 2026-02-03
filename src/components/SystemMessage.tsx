import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeColors } from '../types';

interface SystemMessageProps {
  text: string;
  theme: ThemeColors;
  appearFrame: number;
  /** Whether this is the E2E encryption notice */
  isEncryptionNotice?: boolean;
}

/**
 * System message bubble for encryption notices, group creation, etc.
 * Matches the WhatsApp design with centered bubble.
 */
export const SystemMessage: React.FC<SystemMessageProps> = ({
  text,
  theme,
  appearFrame,
  isEncryptionNotice = false,
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

  const scale = interpolate(scaleProgress, [0, 1], [0.9, 1]);

  const bgColor = isEncryptionNotice ? theme.e2eBubble : theme.systemBubble;
  const textColor = isEncryptionNotice ? theme.e2eText : theme.systemText;
  const bgOpacity = isEncryptionNotice ? 1 : theme.systemBubbleOpacity;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 48px',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          opacity: bgOpacity,
          color: textColor,
          fontSize: 24,
          fontWeight: 400,
          padding: '12px 20px',
          borderRadius: 14,
          boxShadow: '0 1px 1px rgba(11, 20, 26, 0.08)',
          textAlign: 'center',
          lineHeight: 1.4,
          maxWidth: '90%',
        }}
      >
        {isEncryptionNotice && (
          <span style={{ marginRight: 8 }}>🔒</span>
        )}
        {text}
        {isEncryptionNotice && (
          <span
            style={{
              color: '#007BFC',
              marginLeft: 4,
              cursor: 'pointer',
            }}
          >
            Learn more
          </span>
        )}
      </div>
    </div>
  );
};
