import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChatMessage, ThemeColors } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
  theme: ThemeColors;
  appearFrame: number;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  theme,
  appearFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isMe = message.sender.isMe;
  const relativeFrame = frame - appearFrame;

  // Don't render if not yet appeared
  if (relativeFrame < 0) {
    return null;
  }

  // WhatsApp-like pop-in animation
  const scaleProgress = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 15,
      stiffness: 300,
      mass: 0.4,
    },
  });

  const scale = interpolate(scaleProgress, [0, 1], [0.3, 1]);

  const opacity = interpolate(relativeFrame, [0, 3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(
    scaleProgress,
    [0, 0.5, 1],
    [30, -4, 0],
    { extrapolateRight: 'clamp' }
  );

  const translateX = interpolate(
    scaleProgress,
    [0, 1],
    [isMe ? 20 : -20, 0],
    { extrapolateRight: 'clamp' }
  );

  // WhatsApp bubble style - scaled for 1080x1920
  const bubbleStyle: React.CSSProperties = {
    maxWidth: '80%',
    padding: '14px 16px 16px 18px',
    borderRadius: isMe ? '16px 16px 0px 16px' : '16px 16px 16px 0px',
    backgroundColor: isMe ? theme.sentBubble : theme.receivedBubble,
    color: isMe ? theme.sentText : theme.receivedText,
    fontSize: 34,
    lineHeight: 1.35,
    wordWrap: 'break-word',
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    opacity,
    transformOrigin: isMe ? 'bottom right' : 'bottom left',
    boxShadow: '0 2px 1px rgba(11, 20, 26, 0.13)',
    position: 'relative',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isMe ? 'flex-end' : 'flex-start',
    marginBottom: 4,
    paddingLeft: isMe ? 120 : 12,
    paddingRight: isMe ? 12 : 120,
  };

  // Blue double checkmark for sent messages
  const renderCheckmarks = () => {
    if (!isMe) return null;

    const checkOpacity = interpolate(relativeFrame, [5, 10], [0, 1], {
      extrapolateRight: 'clamp',
    });

    return (
      <svg
        width="34"
        height="22"
        viewBox="0 0 16 11"
        fill="none"
        style={{ opacity: checkOpacity, marginLeft: 6, flexShrink: 0 }}
      >
        <path
          d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.046.25.14.343l2.996 2.996a.724.724 0 0 0 .512.203.681.681 0 0 0 .496-.203l6.895-8.676a.442.442 0 0 0 .102-.318.392.392 0 0 0-.178-.299l-.253-.203z"
          fill="#53bdeb"
        />
        <path
          d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.152-1.09a.127.127 0 0 0-.14-.051.13.13 0 0 0-.102.114.12.12 0 0 0 .025.09l1.458 1.458a.724.724 0 0 0 .512.203.681.681 0 0 0 .496-.203l6.895-8.676a.442.442 0 0 0 .102-.318.392.392 0 0 0-.178-.299l-.253-.203z"
          fill="#53bdeb"
        />
      </svg>
    );
  };

  // Timestamp - positioned inline at end of message like real WhatsApp
  const renderTimestamp = () => (
    <span
      style={{
        fontSize: 24,
        color: '#667781',
        marginLeft: 8,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        float: 'right',
        marginTop: 6,
      }}
    >
      {message.timestamp}
      {renderCheckmarks()}
    </span>
  );

  return (
    <div style={containerStyle}>
      <div style={bubbleStyle}>
        <span>{message.content}</span>
        {renderTimestamp()}
      </div>
    </div>
  );
};
