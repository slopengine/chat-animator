import React from 'react';
import { Composition } from 'remotion';
import { z } from 'zod';
import { EditableChatAnimation, calculateEditableDuration } from './compositions/EditableChatAnimation';
import { chatSchema } from './schema';

const FPS = 30;

// Default props matching Figma "Chat A" design
const defaultChatProps: z.infer<typeof chatSchema> = {
  platform: 'whatsapp',
  contactName: 'Anika Shavan',
  contactAvatar: '',
  myAvatar: '',
  showPhoneFrame: true,
  typingSpeed: 5,
  messageSpeed: 5,
  messages: [
    { id: '1', text: '10am coffee?', isMe: false, timestamp: '11:53' },
    { id: '2', text: 'Needed! at the usual? ☕', isMe: true, timestamp: '11:59' },
    { id: '3', text: 'See you there', isMe: false, timestamp: '12:04' },
  ],
};

// Extended conversation (Chat B from Figma)
const extendedChatProps: z.infer<typeof chatSchema> = {
  platform: 'whatsapp',
  contactName: 'Anika Shavan',
  contactAvatar: '',
  myAvatar: '',
  showPhoneFrame: true,
  typingSpeed: 5,
  messageSpeed: 5,
  messages: [
    { id: '1', text: 'Have you watched any of it?', isMe: true, timestamp: '11:50' },
    { id: '2', text: 'Yeah that show is great', isMe: false, timestamp: '11:53' },
    { id: '3', text: 'Needed! at the usual? ☕', isMe: true, timestamp: '11:59' },
    { id: '4', text: 'Free to meet up this week?', isMe: false, timestamp: '09:53' },
    { id: '5', text: "Yeah, I'm free most days. What did you have in mind?", isMe: true, timestamp: '10:59' },
    { id: '6', text: 'I was thinking we could grab coffee at that new cafe', isMe: false, timestamp: '11:02' },
    { id: '7', text: "Sounds great! I've heard good things about it the Matcha", isMe: true, timestamp: '10:59' },
    { id: '8', text: "How about Wednesday afternoon? I'm free after 2 PM", isMe: false, timestamp: '11:35' },
    { id: '9', text: 'Sure', isMe: true, timestamp: '10:59' },
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

      {/* Extended conversation */}
      <Composition
        id="ChatAnimatorExtended"
        component={EditableChatAnimation}
        durationInFrames={calculateDynamicDuration(extendedChatProps)}
        fps={FPS}
        width={1080}
        height={1920}
        schema={chatSchema}
        defaultProps={extendedChatProps}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: calculateDynamicDuration(props),
          };
        }}
      />
    </>
  );
};
