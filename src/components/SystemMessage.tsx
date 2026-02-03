import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
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

  // Scale factor: 1080/375 = 2.88
  const SCALE = 2.88;

  // For encryption notice, use the design image
  if (isEncryptionNotice) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 4 * SCALE,
          paddingBottom: 8 * SCALE,
          paddingLeft: 16 * SCALE,
          paddingRight: 16 * SCALE,
        }}
      >
        <Img
          src={staticFile('system-message.png')}
          style={{
            width: 355 * SCALE, // ~1022px - closer to full width
            height: 'auto',
          }}
        />
      </div>
    );
  }

  // Regular system message (non-encryption)
  const bgColor = theme.systemBubble;
  const textColor = theme.systemText;
  const bgOpacity = theme.systemBubbleOpacity;

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
      }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          opacity: bgOpacity,
          color: textColor,
          fontSize: 13 * SCALE,
          fontWeight: 400,
          padding: `${8 * SCALE}px ${12 * SCALE}px`,
          borderRadius: 8 * SCALE,
          boxShadow: '0 1px 1px rgba(11, 20, 26, 0.08)',
          textAlign: 'center',
          lineHeight: 1.4,
          maxWidth: '90%',
        }}
      >
        {text}
      </div>
    </div>
  );
};
