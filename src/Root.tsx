import React from 'react';
import { Composition } from 'remotion';
import { z } from 'zod';
import { EditableChatAnimation, calculateEditableDuration } from './compositions/EditableChatAnimation';
import { chatSchema } from './schema';

const FPS = 30;

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
      durationInFrames={900}
      fps={FPS}
      width={1080}
      height={1920}
      schema={chatSchema}
      defaultProps={{
        platform: 'whatsapp',
        contactName: 'Anika Shavan',
        contactAvatar: '',
        myAvatar: '',
        showPhoneFrame: false,
        typingSpeed: 5,
        messageSpeed: 5,
        messages: [
          { id: '1', text: 'Have you watched any of it?', isMe: true, timestamp: '11:50' },
          { id: '2', text: 'Yeah that show is great', isMe: false, timestamp: '11:53' },
          { id: '3', text: 'Needed! at the usual? ☕', isMe: true, timestamp: '11:59' },
          { id: '4', text: 'Free to meet up this week?', isMe: false, timestamp: '09:53', showDateBefore: 'Mon 12 May' },
          { id: '5', text: "Yeah, I'm free most days. What did you have in mind?", isMe: true, timestamp: '10:59' },
          { id: '6', text: 'I was thinking we could grab coffee at that new cafe downtown. The one that just opened near the park with the outdoor seating', isMe: false, timestamp: '11:02' },
          { id: '7', text: "Sounds great! I've heard good things about their Matcha lattes. Plus the weather should be nice this week ☀️", isMe: true, timestamp: '10:59' },
          { id: '8', text: "How about Wednesday afternoon? I'm free after 2 PM. We could walk around the park after too if you want", isMe: false, timestamp: '11:35' },
          { id: '9', text: 'Perfect! Wednesday at 2:30 works for me', isMe: true, timestamp: '11:36' },
          { id: '10', text: "Great, I'll send you the address. It's on the corner of Main and 5th", isMe: false, timestamp: '11:37' },
          { id: '11', text: 'Looking forward to it! 🙌', isMe: true, timestamp: '11:38' },
          { id: '12', text: 'Same here! Been wanting to catch up for ages', isMe: false, timestamp: '11:39' },
          { id: '13', text: "I know right? It's been too long. Also wanted to tell you about that job opportunity I mentioned", isMe: true, timestamp: '11:40' },
          { id: '14', text: 'Oh yes! You mentioned something about a design role? Tell me more on Wednesday, sounds interesting', isMe: false, timestamp: '11:41' },
          { id: '15', text: 'Will do! See you then 👋', isMe: true, timestamp: '11:42' },
        ],
        showEncryptionNotice: true,
      }}
      calculateMetadata={({ props }) => {
        return {
          durationInFrames: calculateDynamicDuration(props),
        };
      }}
    />
  );
};
