import React from 'react';
import { Composition } from 'remotion';
import { z } from 'zod';
import { EditableChatAnimation, calculateEditableDuration } from './compositions/EditableChatAnimation';
import { chatSchema, ChatSchema } from './schema';

const FPS = 30;

const calculateDynamicDuration = (props: ChatSchema) => {
  return calculateEditableDuration(
    props.messages,
    props.typingSpeed ?? 5,
    props.messageSpeed ?? 5,
    FPS
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ChatAnimator"
      component={EditableChatAnimation as unknown as React.FC<Record<string, unknown>>}
      durationInFrames={900}
      fps={FPS}
      width={1080}
      height={1920}
      schema={chatSchema}
      defaultProps={{
        // 📱 Platform & Style
        platform: 'whatsapp',
        showPhoneFrame: false,
        showEncryptionNotice: true,
        
        // 👥 Profiles
        contactName: 'Alex',
        contactAvatar: '',
        myAvatar: '',
        
        // ⚡ Animation Speed
        typingSpeed: 5,
        messageSpeed: 5,
        
        // 💬 Conversation (edit these!)
        messages: [
          { id: '1', text: 'Hey! Are you free this weekend?', isMe: false, timestamp: '10:30' },
          { id: '2', text: "Yeah! What's up?", isMe: true, timestamp: '10:32' },
          { id: '3', text: 'Want to grab coffee? ☕', isMe: false, timestamp: '10:33' },
          { id: '4', text: "Sounds great! Where should we meet?", isMe: true, timestamp: '10:35' },
          { id: '5', text: 'How about the new place downtown?', isMe: false, timestamp: '10:36' },
          { id: '6', text: 'Perfect! See you Saturday at 2pm 🙌', isMe: true, timestamp: '10:38' },
        ],
      }}
      calculateMetadata={({ props }) => {
        return {
          durationInFrames: calculateDynamicDuration(props as ChatSchema),
        };
      }}
    />
  );
};
