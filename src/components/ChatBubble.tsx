import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import { ChatMessage, ThemeColors } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
  theme: ThemeColors;
  appearFrame: number;
  /** Show sender name (for group chats) */
  showSenderName?: boolean;
  /** Show avatar next to bubble (for group chats, received messages only) */
  showAvatar?: boolean;
}

/**
 * Chat message bubble matching WhatsApp's exact design from Figma.
 * Features:
 * - Proper bubble colors and shadows
 * - Inline timestamp with read receipts
 * - Support for images/GIFs with labels
 * - Emoji reactions
 * - Group chat sender names with colors
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  theme,
  appearFrame,
  showSenderName = false,
  showAvatar = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isMe = message.sender.isMe;
  const relativeFrame = frame - appearFrame;

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

  // Avatar for group chats (received messages only)
  const renderAvatar = () => {
    if (!showAvatar || isMe) return null;

    const avatarSize = 56;
    
    return (
      <div
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '50%',
          backgroundColor: '#DFE5E7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
          flexShrink: 0,
          alignSelf: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {message.sender.avatar ? (
          <Img
            src={message.sender.avatar}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ 
            fontSize: 24, 
            fontWeight: 500, 
            color: '#8696A0' 
          }}>
            {message.sender.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  // Blue double checkmark for sent messages
  const renderCheckmarks = () => {
    if (!isMe) return null;

    const checkOpacity = interpolate(relativeFrame, [5, 10], [0, 1], {
      extrapolateRight: 'clamp',
    });

    return (
      <svg
        width="32"
        height="20"
        viewBox="0 0 16 11"
        fill="none"
        style={{ opacity: checkOpacity, marginLeft: 6, flexShrink: 0 }}
      >
        <path
          d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.046.25.14.343l2.996 2.996a.724.724 0 0 0 .512.203.681.681 0 0 0 .496-.203l6.895-8.676a.442.442 0 0 0 .102-.318.392.392 0 0 0-.178-.299l-.253-.203z"
          fill={theme.readReceipt}
        />
        <path
          d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.152-1.09a.127.127 0 0 0-.14-.051.13.13 0 0 0-.102.114.12.12 0 0 0 .025.09l1.458 1.458a.724.724 0 0 0 .512.203.681.681 0 0 0 .496-.203l6.895-8.676a.442.442 0 0 0 .102-.318.392.392 0 0 0-.178-.299l-.253-.203z"
          fill={theme.readReceipt}
        />
      </svg>
    );
  };

  // Timestamp - positioned inline at end of message like real WhatsApp
  const renderTimestamp = () => (
    <span
      style={{
        fontSize: 22,
        color: theme.timestamp,
        opacity: theme.timestampOpacity,
        marginLeft: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        float: 'right',
        marginTop: 6,
        whiteSpace: 'nowrap',
      }}
    >
      {message.timestamp}
      {renderCheckmarks()}
    </span>
  );

  // Emoji reactions below the bubble
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionsOpacity = interpolate(relativeFrame, [8, 15], [0, 1], {
      extrapolateRight: 'clamp',
    });

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
          marginTop: -8,
          marginBottom: 8,
          paddingLeft: isMe ? 0 : (showAvatar ? 72 : 16),
          paddingRight: isMe ? 16 : 0,
          opacity: reactionsOpacity,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: '4px 10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            gap: 4,
          }}
        >
          {message.reactions.map((reaction, i) => (
            <span key={i} style={{ fontSize: 20 }}>{reaction}</span>
          ))}
        </div>
      </div>
    );
  };

  // Sender name for group chats
  const renderSenderName = () => {
    if (!showSenderName || isMe) return null;

    return (
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: message.sender.nameColor || '#E91E63',
          marginBottom: 4,
        }}
      >
        {message.sender.name}
      </div>
    );
  };

  // Image/GIF content
  const renderMedia = () => {
    if (message.type !== 'image' && message.type !== 'gif') return null;
    if (!message.imageUrl) return null;

    return (
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <Img
          src={message.imageUrl}
          style={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 12,
            display: 'block',
          }}
        />
        {message.type === 'gif' && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              letterSpacing: 1,
            }}
          >
            GIF
          </div>
        )}
      </div>
    );
  };

  // WhatsApp bubble style - scaled for 1080x1920
  const bubbleStyle: React.CSSProperties = {
    maxWidth: '80%',
    padding: message.type === 'image' || message.type === 'gif' 
      ? '6px 6px 10px 6px' 
      : '12px 14px 14px 16px',
    // WhatsApp uses different corner radius for sent vs received
    // Sent: rounded except bottom-right
    // Received: rounded except bottom-left  
    borderRadius: isMe 
      ? '16px 16px 4px 16px'   // Sent message tail on bottom-right
      : '16px 16px 16px 4px',  // Received message tail on bottom-left
    backgroundColor: isMe ? theme.sentBubble : theme.receivedBubble,
    color: isMe ? theme.sentText : theme.receivedText,
    fontSize: 30,
    lineHeight: 1.35,
    wordWrap: 'break-word',
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    opacity,
    transformOrigin: isMe ? 'bottom right' : 'bottom left',
    boxShadow: '0 1px 1px rgba(11, 20, 26, 0.13)',
    position: 'relative',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
    paddingLeft: isMe ? 100 : 16,
    paddingRight: isMe ? 16 : 100,
    justifyContent: isMe ? 'flex-end' : 'flex-start',
  };

  return (
    <>
      <div style={containerStyle}>
        {renderAvatar()}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
          <div style={bubbleStyle}>
            {renderSenderName()}
            {renderMedia()}
            {message.content && (
              <span>{message.content}</span>
            )}
            {renderTimestamp()}
          </div>
        </div>
      </div>
      {renderReactions()}
    </>
  );
};
