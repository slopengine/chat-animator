import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { 
  ChatBubble, 
  TypingIndicator, 
  ChatHeader, 
  PhoneFrame, 
  InputBar, 
  WhatsAppBackground,
  DateSeparator,
  SystemMessage,
  StatusBar,
} from '../components';
import { ChatMessage, platformThemes, User } from '../types';
import { MessageSchema } from '../schema';

interface EditableChatProps {
  platform: 'whatsapp' | 'imessage' | 'messenger';
  contactName: string;
  contactAvatar: string;
  myAvatar: string;
  showPhoneFrame: boolean;
  typingSpeed: number;
  messageSpeed: number;
  messages: MessageSchema[];
}

interface MessageTiming {
  message: ChatMessage;
  typingStart: number;
  typingEnd: number;
  appearFrame: number;
}

/**
 * Editable chat animation with Remotion Studio props panel.
 * Matches WhatsApp design from Figma exactly.
 */
export const EditableChatAnimation: React.FC<EditableChatProps> = ({
  platform,
  contactName,
  contactAvatar,
  myAvatar,
  showPhoneFrame,
  typingSpeed,
  messageSpeed,
  messages,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const theme = platformThemes[platform];
  const isWhatsApp = platform === 'whatsapp';

  // Convert speed scales (1-10) to frame durations
  const typingDuration = Math.round(90 - (typingSpeed - 1) * 8.33);
  const messageDelay = Math.round(60 - (messageSpeed - 1) * 5);
  const initialDelay = 30; // Time for encryption notice + date to appear

  // Create users
  const me: User = useMemo(() => ({
    id: 'me',
    name: 'Me',
    avatar: myAvatar || undefined,
    isMe: true,
  }), [myAvatar]);

  const contact: User = useMemo(() => ({
    id: 'contact',
    name: contactName || 'Contact',
    avatar: contactAvatar || undefined,
    isMe: false,
  }), [contactName, contactAvatar]);

  // Convert MessageSchema[] to ChatMessage[]
  const chatMessages: ChatMessage[] = useMemo(() => {
    return messages.map((msg, index) => ({
      id: msg.id || `msg-${index}`,
      sender: msg.isMe ? me : contact,
      content: msg.text,
      timestamp: msg.timestamp || new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
      }),
      type: 'text' as const,
    }));
  }, [messages, me, contact]);

  // Calculate timing for each message
  const messageTimings = useMemo(() => {
    const timings: MessageTiming[] = [];
    let currentFrame = initialDelay;

    chatMessages.forEach((message) => {
      const isFromOther = !message.sender.isMe;

      if (isFromOther) {
        const typingStart = currentFrame;
        const typingEnd = currentFrame + typingDuration;
        const appearFrame = typingEnd;

        timings.push({
          message,
          typingStart,
          typingEnd,
          appearFrame,
        });

        currentFrame = appearFrame + messageDelay;
      } else {
        timings.push({
          message,
          typingStart: -1,
          typingEnd: -1,
          appearFrame: currentFrame,
        });

        currentFrame += messageDelay;
      }
    });

    return timings;
  }, [chatMessages, typingDuration, messageDelay, initialDelay]);

  // Get current typing indicator
  const currentTyping = messageTimings.find(
    (t) => t.typingStart >= 0 && frame >= t.typingStart && frame < t.typingEnd
  );

  // Encryption notice text (from Figma)
  const encryptionNotice = "Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.";

  // Messages area content
  const messagesArea = (
    <div
      style={{
        flex: 1,
        overflowY: 'hidden',
        padding: '8px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Encryption notice at top (WhatsApp only) */}
        {isWhatsApp && (
          <SystemMessage
            text={encryptionNotice}
            theme={theme}
            appearFrame={0}
            isEncryptionNotice
          />
        )}

        {/* Date separator */}
        {isWhatsApp && (
          <DateSeparator
            date="Mon 23 Oct"
            theme={theme}
            appearFrame={5}
          />
        )}

        {/* Messages */}
        {messageTimings.map((timing) => (
          <ChatBubble
            key={timing.message.id}
            message={timing.message}
            theme={theme}
            appearFrame={timing.appearFrame}
          />
        ))}

        {/* Typing indicator */}
        {currentTyping && (
          <TypingIndicator
            theme={theme}
            startFrame={currentTyping.typingStart}
            endFrame={currentTyping.typingEnd}
            senderName={currentTyping.message.sender.name}
          />
        )}
      </div>
    </div>
  );

  const chatContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.background,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* iOS Status Bar */}
      {isWhatsApp && <StatusBar time="9:41" />}
      
      <ChatHeader 
        platform={platform} 
        theme={theme} 
        otherUser={contact}
        subtitle={isWhatsApp ? 'online' : undefined}
      />

      {/* Use WhatsApp background with doodle pattern */}
      {isWhatsApp ? (
        <WhatsAppBackground>
          {messagesArea}
        </WhatsAppBackground>
      ) : (
        messagesArea
      )}

      <InputBar platform={platform} theme={theme} />
    </div>
  );

  if (showPhoneFrame) {
    const padding = 40;
    const phoneAspectRatio = 375 / 812; // iPhone aspect ratio from Figma
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
        <PhoneFrame platform={platform} width={phoneWidth} height={phoneHeight}>
          {chatContent}
        </PhoneFrame>
      </AbsoluteFill>
    );
  }

  return <AbsoluteFill>{chatContent}</AbsoluteFill>;
};

// Helper to calculate duration based on messages
export function calculateEditableDuration(
  messages: MessageSchema[],
  typingSpeed: number,
  messageSpeed: number,
  fps: number = 30
): number {
  const typingDuration = Math.round(90 - (typingSpeed - 1) * 8.33);
  const messageDelay = Math.round(60 - (messageSpeed - 1) * 5);
  const initialDelay = 30; // Account for encryption notice + date

  let totalFrames = initialDelay;

  messages.forEach((msg) => {
    if (!msg.isMe) {
      totalFrames += typingDuration + messageDelay;
    } else {
      totalFrames += messageDelay;
    }
  });

  // Add buffer at the end
  totalFrames += fps * 2;

  return Math.max(totalFrames, fps * 3);
}
