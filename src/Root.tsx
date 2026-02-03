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
  showPhoneFrame: false, // No phone frame - direct chat UI
  typingSpeed: 5,
  messageSpeed: 5,
  messages: [
    { id: '1', text: '10am coffee?', isMe: false, timestamp: '11:53' },
    { id: '2', text: 'Needed! at the usual? ☕', isMe: true, timestamp: '11:59' },
    { id: '3', text: 'See you there', isMe: false, timestamp: '12:04' },
  ],
};

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
  );
};
