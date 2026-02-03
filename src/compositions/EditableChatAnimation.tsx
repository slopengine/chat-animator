import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
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

interface ExtendedMessageTiming extends MessageTiming {
  showDateBefore?: string;
}

interface EditableChatProps {
  platform: 'whatsapp' | 'imessage' | 'messenger';
  contactName?: string;
  contactAvatar?: string;
  myAvatar?: string;
  showPhoneFrame?: boolean;
  typingSpeed?: number;
  messageSpeed?: number;
  messages: MessageSchema[];
  showEncryptionNotice?: boolean;
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
  contactName = 'Contact',
  contactAvatar = '',
  myAvatar = '',
  showPhoneFrame = false,
  typingSpeed = 5,
  messageSpeed = 5,
  messages,
  showEncryptionNotice = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
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

  // Convert MessageSchema[] to ChatMessage[] with date separator info
  const chatMessages: (ChatMessage & { showDateBefore?: string })[] = useMemo(() => {
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
      showDateBefore: msg.showDateBefore,
    }));
  }, [messages, me, contact]);

  // Calculate timing for each message
  // Supports two modes:
  // 1. Auto-calculated timing (when startFrame is not set)
  // 2. Manual timing from timeline editor (when startFrame is set)
  const messageTimings = useMemo(() => {
    const timings: ExtendedMessageTiming[] = [];
    let currentFrame = initialDelay;
    
    // Check if any message has manual timing
    const hasManualTiming = messages.some(m => m.startFrame !== undefined);

    chatMessages.forEach((message, index) => {
      const originalMsg = messages[index];
      const isFromOther = !message.sender.isMe;
      
      // Use manual timing if specified
      if (hasManualTiming && originalMsg.startFrame !== undefined) {
        const manualStart = originalMsg.startFrame;
        
        if (isFromOther) {
          // For "other" messages, typing starts at startFrame - typingDuration
          const typingStart = Math.max(0, manualStart - typingDuration);
          const typingEnd = manualStart;
          
          timings.push({
            message,
            typingStart,
            typingEnd,
            appearFrame: manualStart,
            showDateBefore: message.showDateBefore,
          });
        } else {
          timings.push({
            message,
            typingStart: -1,
            typingEnd: -1,
            appearFrame: manualStart,
            showDateBefore: message.showDateBefore,
          });
        }
        return;
      }

      // Auto-calculate timing (original behavior)
      // Add extra delay for date separator
      if (message.showDateBefore) {
        currentFrame += 15; // Small delay before date separator
      }

      if (isFromOther) {
        const typingStart = currentFrame;
        const typingEnd = currentFrame + typingDuration;
        const appearFrame = typingEnd;

        timings.push({
          message,
          typingStart,
          typingEnd,
          appearFrame,
          showDateBefore: message.showDateBefore,
        });

        currentFrame = appearFrame + messageDelay;
      } else {
        timings.push({
          message,
          typingStart: -1,
          typingEnd: -1,
          appearFrame: currentFrame,
          showDateBefore: message.showDateBefore,
        });

        currentFrame += messageDelay;
      }
    });

    return timings;
  }, [chatMessages, messages, typingDuration, messageDelay, initialDelay]);

  // Get current typing indicator
  const currentTyping = messageTimings.find(
    (t) => t.typingStart >= 0 && frame >= t.typingStart && frame < t.typingEnd
  );

  // Encryption notice text (from Figma)
  const encryptionNotice = "Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.";

  // Scale factor for sizing
  const SCALE = 2.88;
  
  // Component heights (all scaled from 375px Figma design)
  const STATUS_BAR_HEIGHT = 44 * SCALE; // ~127px
  const HEADER_HEIGHT = 44 * SCALE; // ~127px
  // InputBar height (measured from component)
  const INPUT_BAR_HEIGHT = 66 * SCALE; // ~190px
  
  // Measured component heights (all in pixels at 1080px canvas, calculated from actual styles)
  // DateSeparator: measured from actual rendering
  const DATE_SEPARATOR_HEIGHT = 130;
  // SystemMessage: measured from actual rendering  
  const ENCRYPTION_NOTICE_HEIGHT = 240;
  // ChatBubble: fine-tuned based on visual testing - includes timestamp space
  const MESSAGE_BASE_HEIGHT = 135;
  // Additional height per text line
  const MESSAGE_LINE_HEIGHT = 64;
  // Typing indicator uses UNSCALED pixels
  const TYPING_INDICATOR_HEIGHT = 65;
  // Desired gap above input bar - increased slightly for timestamp visibility
  const BOTTOM_PADDING = 52;
  // Visible area = canvas - status bar - header - input bar
  const VISIBLE_AREA_HEIGHT = 1920 - STATUS_BAR_HEIGHT - HEADER_HEIGHT - INPUT_BAR_HEIGHT;
  
  // Height calculation per message
  // ~25 chars per line based on: 80% max-width of ~700px, minus padding ~70px = 630px
  // At fontSize 49px with average char width 0.5*fontSize = 24.5px → ~25 chars/line
  const getMessageHeight = (text: string) => {
    const charsPerLine = 25;
    const lines = Math.ceil(text.length / charsPerLine);
    return MESSAGE_BASE_HEIGHT + Math.max(0, lines - 1) * MESSAGE_LINE_HEIGHT;
  };

  // Calculate scroll offset - updates when messages appear or typing starts
  const currentScrollOffset = useMemo(() => {
    // Find all messages that have appeared
    const visibleTimings = messageTimings.filter(t => frame >= t.appearFrame);
    
    // Check if typing indicator is currently showing
    const isTypingVisible = messageTimings.some(
      t => t.typingStart >= 0 && frame >= t.typingStart && frame < t.typingEnd
    );
    
    if (visibleTimings.length === 0 && !isTypingVisible) return 0;
    
    // Calculate total content height for visible messages
    let totalHeight = 0;
    
    // Add encryption notice height if shown
    if (isWhatsApp && showEncryptionNotice) {
      totalHeight += ENCRYPTION_NOTICE_HEIGHT;
    }
    
    // Add height for each visible message (based on text length)
    visibleTimings.forEach((timing) => {
      if (timing.showDateBefore) {
        totalHeight += DATE_SEPARATOR_HEIGHT;
      }
      totalHeight += getMessageHeight(timing.message.content || '');
    });
    
    // Add typing indicator height if visible
    if (isTypingVisible) {
      totalHeight += TYPING_INDICATOR_HEIGHT;
    }
    
    // Add bottom padding to total content height
    totalHeight += BOTTOM_PADDING;
    
    // Calculate target scroll (how much content overflows)
    const targetScroll = Math.max(0, totalHeight - VISIBLE_AREA_HEIGHT);
    
    if (targetScroll === 0) return 0;
    
    // Find the most recent message that appeared
    const lastVisibleTiming = visibleTimings[visibleTimings.length - 1];
    const scrollTriggerFrame = lastVisibleTiming.appearFrame;
    
    // Calculate what the scroll was BEFORE this message appeared
    let prevHeight = 0;
    if (isWhatsApp && showEncryptionNotice) {
      prevHeight += ENCRYPTION_NOTICE_HEIGHT;
    }
    visibleTimings.slice(0, -1).forEach((timing) => {
      if (timing.showDateBefore) {
        prevHeight += DATE_SEPARATOR_HEIGHT;
      }
      prevHeight += getMessageHeight(timing.message.content || '');
    });
    // If last message was from "other" (had typing), the typing indicator was visible before
    if (lastVisibleTiming.typingStart >= 0) {
      prevHeight += TYPING_INDICATOR_HEIGHT;
    }
    prevHeight += BOTTOM_PADDING;
    const prevScroll = Math.max(0, prevHeight - VISIBLE_AREA_HEIGHT);
    
    // Animate from previous scroll to target scroll over 12 frames with smooth ease
    const scrollProgress = interpolate(
      frame,
      [scrollTriggerFrame, scrollTriggerFrame + 12],
      [0, 1],
      { 
        extrapolateLeft: 'clamp', 
        extrapolateRight: 'clamp',
        easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, // Ease in-out quad
      }
    );
    
    return prevScroll + (targetScroll - prevScroll) * scrollProgress;
  }, [frame, messageTimings, isWhatsApp, showEncryptionNotice]);

  // Messages area content
  const messagesArea = (
    <div
      style={{
        flex: 1,
        overflowY: 'hidden',
        overflowX: 'visible', // Allow nubs to extend past container
        padding: 0, // No extra padding - let content fill the space
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          transform: `translateY(-${currentScrollOffset}px)`,
          overflow: 'visible', // Allow nubs to show
          paddingBottom: BOTTOM_PADDING, // Small padding at bottom
        }}
      >
        {/* Encryption notice at top (WhatsApp only, optional) */}
        {isWhatsApp && showEncryptionNotice && (
          <SystemMessage
            text={encryptionNotice}
            theme={theme}
            appearFrame={0}
            isEncryptionNotice
          />
        )}

        {/* Messages with date separators */}
        {messageTimings.map((timing, index) => {
          const isMe = timing.message.sender.isMe;
          const msgText = timing.message.content || '';
          const truncatedText = msgText.length > 25 ? msgText.slice(0, 25) + '...' : msgText;
          const sequenceName = `${isMe ? '→ Me' : '← ' + timing.message.sender.name}: ${truncatedText}`;
          
          return (
            <React.Fragment key={timing.message.id}>
              {/* Date separator before this message if specified */}
              {timing.showDateBefore && (
                <Sequence
                  name={`📅 ${timing.showDateBefore}`}
                  from={Math.max(0, timing.appearFrame - 10)}
                  durationInFrames={durationInFrames - Math.max(0, timing.appearFrame - 10)}
                  layout="none"
                >
                  <DateSeparator
                    date={timing.showDateBefore}
                    theme={theme}
                    appearFrame={0}
                  />
                </Sequence>
              )}
              <Sequence
                name={sequenceName}
                from={timing.appearFrame}
                durationInFrames={durationInFrames - timing.appearFrame}
                layout="none"
              >
                <ChatBubble
                  message={timing.message}
                  theme={theme}
                  appearFrame={0}
                />
              </Sequence>
            </React.Fragment>
          );
        })}

        {/* Typing indicators - each wrapped in a Sequence */}
        {messageTimings
          .filter(t => t.typingStart >= 0)
          .map((timing, index) => {
            const typingDuration = timing.typingEnd - timing.typingStart;
            return (
              <Sequence
                key={`typing-${timing.message.id}`}
                name={`⏳ ${timing.message.sender.name} typing...`}
                from={timing.typingStart}
                durationInFrames={typingDuration}
                layout="none"
              >
                <TypingIndicator
                  theme={theme}
                  startFrame={0}
                  endFrame={typingDuration}
                  senderName={timing.message.sender.name}
                />
              </Sequence>
            );
          })}
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
