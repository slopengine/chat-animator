import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
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

  // Message not visible yet
  if (relativeFrame < 0) {
    return null;
  }

  // No animation - messages just appear instantly
  const opacity = 1;
  const scale = 1;
  const translateX = 0;
  const translateY = 0;

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

  // Blue double checkmark for sent messages (scaled 2.88x)
  const renderCheckmarks = () => {
    if (!isMe) return null;

    // Checkmarks appear instantly 0.5s (15 frames) after message sent
    const checkOpacity = relativeFrame >= 15 ? 1 : 0;

    return (
      <svg
        width="46"
        height="29"
        viewBox="0 0 16 11"
        fill="none"
        style={{ opacity: checkOpacity, marginLeft: 8, flexShrink: 0 }}
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
  // Scaled 2.88x from Figma
  const SCALE_TS = 2.88;
  const renderTimestamp = () => (
    <span
      style={{
        fontSize: 11 * SCALE_TS, // 11px in Figma → ~32px
        color: theme.timestamp,
        opacity: theme.timestampOpacity,
        marginLeft: 8 * SCALE_TS,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        float: 'right',
        marginTop: 4 * SCALE_TS,
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

  // WhatsApp bubble style - scaled for 1080x1920 (2.88x from 375px Figma)
  const SCALE = 2.88;
  const nubSize = 15 * SCALE; // 15px nub scaled
  
  const bubbleStyle: React.CSSProperties = {
    maxWidth: '80%',
    padding: message.type === 'image' || message.type === 'gif' 
      ? `${6 * SCALE}px ${6 * SCALE}px ${10 * SCALE}px ${6 * SCALE}px`
      : `${10 * SCALE}px ${12 * SCALE}px ${10 * SCALE}px ${12 * SCALE}px`,
    // WhatsApp rounded corners - larger radius at nub corner to blend with tail
    borderRadius: isMe 
      ? `${18 * SCALE}px ${18 * SCALE}px ${10 * SCALE}px ${18 * SCALE}px`
      : `${18 * SCALE}px ${18 * SCALE}px ${18 * SCALE}px ${10 * SCALE}px`,
    backgroundColor: isMe ? theme.sentBubble : theme.receivedBubble,
    color: isMe ? theme.sentText : theme.receivedText,
    fontSize: 17 * SCALE, // 17px in Figma → ~49px
    lineHeight: 1.35,
    wordWrap: 'break-word',
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    opacity,
    transformOrigin: isMe ? 'bottom right' : 'bottom left',
    // Shadow applied to wrapper with drop-shadow for bubble+nub
    position: 'relative',
  };

  // Nub size scaled up
  const nubSizeLarge = 20 * SCALE; // Bigger nub
  
  // Nub (tail) - absolutely positioned INSIDE the bubble
  const renderNub = () => {
    if (isMe) {
      // Green nub on right for sent messages
      return (
        <svg 
          width={nubSizeLarge} 
          height={nubSizeLarge} 
          viewBox="0 0 15 15" 
          fill="none"
          style={{
            position: 'absolute',
            bottom: 0,
            right: -6 * SCALE,
            pointerEvents: 'none',
          }}
        >
          <path d="M8.5 0C8.5 6.40985 11.8169 11.4178 14.0784 13.7039C14.4376 14.067 14.1547 14.8631 13.6447 14.8381C5.44705 14.4367 1.70934 11.4213 0 10.0009L4.5 1L8.5 0Z" fill={theme.sentBubble}/>
        </svg>
      );
    } else {
      // White nub on left for received messages
      return (
        <svg 
          width={nubSizeLarge} 
          height={nubSizeLarge} 
          viewBox="0 0 15 15" 
          fill="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: -6 * SCALE,
            pointerEvents: 'none',
          }}
        >
          <path d="M5.73975 0C5.73975 6.40985 2.42289 11.4178 0.161313 13.7039C-0.197851 14.067 0.0850074 14.8631 0.595092 14.8381C8.7927 14.4367 12.5304 11.4213 14.2397 10.0009L9.73975 1L5.73975 0Z" fill={theme.receivedBubble}/>
        </svg>
      );
    }
  };

  // Container with scaled padding (2.88x) - WhatsApp standard margins
  const SCALE_C = 2.88;
  const edgePadding = 10 * SCALE_C;  // ~29px breathing room on both edges
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 3 * SCALE_C,
    paddingLeft: isMe ? 60 * SCALE_C : edgePadding,
    paddingRight: isMe ? edgePadding : 60 * SCALE_C,
    justifyContent: isMe ? 'flex-end' : 'flex-start',
  };

  return (
    <>
      <div style={containerStyle}>
        {renderAvatar()}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: isMe ? 'flex-end' : 'flex-start',
        }}>
          {/* Bubble with nub inside (absolutely positioned) */}
          <div style={{
            ...bubbleStyle,
            position: 'relative',
            overflow: 'visible',
            filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.08))',
          }}>
            {renderSenderName()}
            {renderMedia()}
            {message.content && (
              <span>{message.content}</span>
            )}
            {renderTimestamp()}
            {renderNub()}
          </div>
        </div>
      </div>
      {renderReactions()}
    </>
  );
};
