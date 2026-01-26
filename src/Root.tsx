import React from 'react';
import { Composition } from 'remotion';
import { z } from 'zod';
import { EditableChatAnimation, calculateEditableDuration } from './compositions/EditableChatAnimation';
import { chatSchema } from './schema';

const FPS = 30;

// Default props that match the schema
const defaultChatProps: z.infer<typeof chatSchema> = {
  platform: 'whatsapp',
  contactName: 'Alice',
  contactAvatar: '',
  myAvatar: '',
  showPhoneFrame: true,
  typingSpeed: 5,
  messageSpeed: 5,
  messages: [
    { id: '1', text: 'Hey! How are you doing?', isMe: false, timestamp: '9:41 AM' },
    { id: '2', text: 'I am great, thanks for asking!', isMe: true, timestamp: '9:41 AM' },
    { id: '3', text: 'Want to grab coffee later?', isMe: false, timestamp: '9:42 AM' },
    { id: '4', text: 'Sure! What time works for you?', isMe: true, timestamp: '9:42 AM' },
    { id: '5', text: 'How about 3pm at the usual place?', isMe: false, timestamp: '9:43 AM' },
    { id: '6', text: 'Perfect, see you there! ☕', isMe: true, timestamp: '9:43 AM' },
  ],
};

// Calculate a generous duration that will recalculate based on props
const calculateDynamicDuration = (props: z.infer<typeof chatSchema>) => {
  return calculateEditableDuration(
    props.messages,
    props.typingSpeed,
    props.messageSpeed,
    FPS
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ==================== MAIN EDITABLE COMPOSITION ==================== */}

      {/* Portrait format - TikTok/Reels/Stories */}
      <Composition
        id="ChatAnimator"
        component={EditableChatAnimation}
        durationInFrames={calculateDynamicDuration(defaultChatProps)}
        fps={FPS}
        width={1080}
        height={1920}
        schema={chatSchema}
        defaultProps={defaultChatProps}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: calculateDynamicDuration(props),
          };
        }}
      />

      {/* Square format - Instagram Feed */}
      <Composition
        id="ChatAnimatorSquare"
        component={EditableChatAnimation}
        durationInFrames={calculateDynamicDuration(defaultChatProps)}
        fps={FPS}
        width={1080}
        height={1080}
        schema={chatSchema}
        defaultProps={defaultChatProps}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: calculateDynamicDuration(props),
          };
        }}
      />

      {/* Landscape format - YouTube */}
      <Composition
        id="ChatAnimatorLandscape"
        component={EditableChatAnimation}
        durationInFrames={calculateDynamicDuration(defaultChatProps)}
        fps={FPS}
        width={1920}
        height={1080}
        schema={chatSchema}
        defaultProps={defaultChatProps}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: calculateDynamicDuration(props),
          };
        }}
      />

      {/* No phone frame - for embedding */}
      <Composition
        id="ChatAnimatorNoFrame"
        component={EditableChatAnimation}
        durationInFrames={calculateDynamicDuration({ ...defaultChatProps, showPhoneFrame: false })}
        fps={FPS}
        width={390}
        height={844}
        schema={chatSchema}
        defaultProps={{ ...defaultChatProps, showPhoneFrame: false }}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: calculateDynamicDuration(props),
          };
        }}
      />
    </>
  );
};
