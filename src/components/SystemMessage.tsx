import React from 'react';
import { useCurrentFrame } from 'remotion';
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
  const relativeFrame = frame - appearFrame;

  if (relativeFrame < 0) {
    return null;
  }

  // No animation - just appear instantly
  const opacity = 1;
  const scale = 1;

  const bgColor = isEncryptionNotice ? theme.e2eBubble : theme.systemBubble;
  const textColor = isEncryptionNotice ? theme.e2eText : theme.systemText;
  const bgOpacity = isEncryptionNotice ? 1 : theme.systemBubbleOpacity;

  // Scale factor: 1080/375 = 2.88
  const SCALE = 2.88;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4 * SCALE,
        paddingBottom: 8 * SCALE,
        paddingLeft: 24 * SCALE,
        paddingRight: 24 * SCALE,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          opacity: bgOpacity,
          color: textColor,
          fontSize: 13 * SCALE, // ~37px
          fontWeight: 400,
          padding: `${8 * SCALE}px ${12 * SCALE}px`,
          borderRadius: 8 * SCALE,
          boxShadow: '0 1px 1px rgba(11, 20, 26, 0.08)',
          textAlign: 'center',
          lineHeight: 1.4,
          maxWidth: '90%',
        }}
      >
        {isEncryptionNotice && (
          <span style={{ marginRight: 6 * SCALE }}>🔒</span>
        )}
        {text}
      </div>
    </div>
  );
};
