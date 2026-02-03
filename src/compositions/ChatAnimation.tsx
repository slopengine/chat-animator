import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
} from 'remotion';
import { 
  ChatBubble, 
  TypingIndicator, 
  ChatHeader, 
  PhoneFrame, 
  InputBar,
  WhatsAppBackground,
  DateSeparator,
  SystemMessage,
} from '../components';
import { ChatConfig, ChatMessage, platformThemes } from '../types';

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

/**
 * Main chat animation composition.
 * Renders a WhatsApp-style chat with animated messages.
 */
export const ChatAnimation: React.FC<ChatAnimationProps> = ({
  config,
  showPhoneFrame = true,
}) => {
  const frame = useCurrentFrame();
  const theme = platformThemes[config.platform];

  // Calculate timing for each message
  const messageTimings = useMemo(() => {
    const timings: MessageTiming[] = [];
    let currentFrame = config.initialDelay;

    config.messages.forEach((message) => {
      const isFromOther = !message.sender.isMe;

      // System messages appear without typing
      if (message.type === 'system') {
        timings.push({
          message,
          typingStart: -1,
          typingEnd: -1,
          appearFrame: currentFrame,
        });
        currentFrame += config.messageDelay / 2;
        return;
      }

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
          typingStart: -1,
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

  // Encryption notice text
  const encryptionNotice = "Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.";

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
      <ChatHeader 
        platform={config.platform} 
        theme={theme} 
        otherUser={otherUser}
        title={config.chatTitle}
        subtitle={config.chatSubtitle}
        isGroupChat={config.isGroupChat}
      />

      {/* Chat messages area with WhatsApp background */}
      {config.platform === 'whatsapp' ? (
        <WhatsAppBackground>
          <div
            style={{
              flex: 1,
              overflowY: 'hidden',
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Encryption notice at top */}
            <SystemMessage
              text={encryptionNotice}
              theme={theme}
              appearFrame={0}
              isEncryptionNotice
            />

            {/* Date separator */}
            <DateSeparator
              date="Mon 23 Oct"
              theme={theme}
              appearFrame={5}
            />

            {/* Render messages */}
            {messageTimings.map((timing) => {
              if (timing.message.type === 'system') {
                return (
                  <SystemMessage
                    key={timing.message.id}
                    text={timing.message.systemText || timing.message.content}
                    theme={theme}
                    appearFrame={timing.appearFrame}
                  />
                );
              }

              return (
                <ChatBubble
                  key={timing.message.id}
                  message={timing.message}
                  theme={theme}
                  appearFrame={timing.appearFrame}
                  showSenderName={config.isGroupChat}
                  showAvatar={config.isGroupChat}
                />
              );
            })}

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
        </WhatsAppBackground>
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: 'hidden',
            padding: '8px 0',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.background,
          }}
        >
          {messageTimings.map((timing) => (
            <ChatBubble
              key={timing.message.id}
              message={timing.message}
              theme={theme}
              appearFrame={timing.appearFrame}
            />
          ))}

          {currentTyping && (
            <TypingIndicator
              theme={theme}
              startFrame={currentTyping.typingStart}
              endFrame={currentTyping.typingEnd}
              senderName={currentTyping.message.sender.name}
            />
          )}
        </div>
      )}

      <InputBar platform={config.platform} theme={theme} />
    </div>
  );

  if (showPhoneFrame) {
    // Calculate phone dimensions to fit within the video with padding
    const padding = 40;
    const phoneAspectRatio = 375 / 812; // iPhone aspect ratio from Figma
    
    // For 1080x1920, we want the phone to fit nicely
    const videoWidth = 1080;
    const videoHeight = 1920;
    
    const maxPhoneHeight = videoHeight - padding * 2;
    const maxPhoneWidth = videoWidth - padding * 2;

    let phoneHeight = maxPhoneHeight;
    let phoneWidth = phoneHeight * phoneAspectRatio;

    if (phoneWidth > maxPhoneWidth) {
      phoneWidth = maxPhoneWidth;
      phoneHeight = phoneWidth / phoneAspectRatio;
    }

    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#1E1E1E',
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
