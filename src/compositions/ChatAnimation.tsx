import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from 'remotion';
import { ChatBubble, TypingIndicator, ChatHeader, PhoneFrame, InputBar } from '../components';
import { ChatConfig, ChatMessage, platformThemes, User } from '../types';

interface ChatAnimationProps {
  config: ChatConfig;
  showPhoneFrame?: boolean;
}

interface MessageTiming {
  message: ChatMessage;
  typingStart: number;
  typingEnd: number;
  appearFrame: number;
}

export const ChatAnimation: React.FC<ChatAnimationProps> = ({
  config,
  showPhoneFrame = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const theme = platformThemes[config.platform];

  // Calculate timing for each message
  const messageTimings = useMemo(() => {
    const timings: MessageTiming[] = [];
    let currentFrame = config.initialDelay;

    config.messages.forEach((message, index) => {
      const isFromOther = !message.sender.isMe;

      // If message is from someone else, show typing indicator
      if (isFromOther) {
        const typingStart = currentFrame;
        const typingEnd = currentFrame + config.typingDuration;
        const appearFrame = typingEnd;

        timings.push({
          message,
          typingStart,
          typingEnd,
          appearFrame,
        });

        currentFrame = appearFrame + config.messageDelay;
      } else {
        // Messages from "me" appear immediately (after a small delay)
        timings.push({
          message,
          typingStart: -1, // No typing indicator for own messages
          typingEnd: -1,
          appearFrame: currentFrame,
        });

        currentFrame += config.messageDelay;
      }
    });

    return timings;
  }, [config]);

  // Find the other user (not "me")
  const otherUser = config.users.find((u) => !u.isMe) || config.users[0];

  // Get current typing indicator (if any)
  const currentTyping = messageTimings.find(
    (t) => t.typingStart >= 0 && frame >= t.typingStart && frame < t.typingEnd
  );

  const chatContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.background,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <ChatHeader platform={config.platform} theme={theme} otherUser={otherUser} />

      {/* Chat messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'hidden',
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Render messages */}
        {messageTimings.map((timing, index) => (
          <ChatBubble
            key={timing.message.id}
            message={timing.message}
            theme={theme}
            appearFrame={timing.appearFrame}
          />
        ))}

        {/* Render typing indicator */}
        {currentTyping && (
          <TypingIndicator
            theme={theme}
            startFrame={currentTyping.typingStart}
            endFrame={currentTyping.typingEnd}
            senderName={currentTyping.message.sender.name}
          />
        )}
      </div>

      <InputBar platform={config.platform} theme={theme} />
    </div>
  );

  if (showPhoneFrame) {
    // Calculate phone dimensions to fit within the video with padding
    const padding = 40;
    const phoneAspectRatio = 0.46; // iPhone-like aspect ratio
    const maxPhoneHeight = height - padding * 2;
    const maxPhoneWidth = width - padding * 2;

    let phoneHeight = maxPhoneHeight;
    let phoneWidth = phoneHeight * phoneAspectRatio;

    if (phoneWidth > maxPhoneWidth) {
      phoneWidth = maxPhoneWidth;
      phoneHeight = phoneWidth / phoneAspectRatio;
    }

    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#1e1e1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PhoneFrame
          platform={config.platform}
          width={phoneWidth}
          height={phoneHeight}
        >
          {chatContent}
        </PhoneFrame>
      </AbsoluteFill>
    );
  }

  return <AbsoluteFill>{chatContent}</AbsoluteFill>;
};
