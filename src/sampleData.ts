import { ChatConfig, ChatMessage, User } from './types';

// Sample users
export const sampleUsers: User[] = [
  {
    id: 'me',
    name: 'Me',
    isMe: true,
  },
  {
    id: 'alice',
    name: 'Alice',
    isMe: false,
  },
];

// Sample WhatsApp conversation
export const whatsappConversation: ChatConfig = {
  platform: 'whatsapp',
  users: sampleUsers,
  typingDuration: 45, // ~1.5 seconds at 30fps
  messageDelay: 30, // ~1 second between messages
  initialDelay: 30, // Start after 1 second
  messages: [
    {
      id: '1',
      sender: sampleUsers[1], // Alice
      content: 'Hey! Did you see the new update? 🎉',
      timestamp: '9:41 AM',
      type: 'text',
    },
    {
      id: '2',
      sender: sampleUsers[0], // Me
      content: 'Not yet! What changed?',
      timestamp: '9:41 AM',
      type: 'text',
    },
    {
      id: '3',
      sender: sampleUsers[1], // Alice
      content: 'They added dark mode finally! It looks amazing',
      timestamp: '9:42 AM',
      type: 'text',
    },
    {
      id: '4',
      sender: sampleUsers[0], // Me
      content: "Nice! I've been waiting for that forever",
      timestamp: '9:42 AM',
      type: 'text',
    },
    {
      id: '5',
      sender: sampleUsers[1], // Alice
      content: 'Same here! Want to try it out together later?',
      timestamp: '9:43 AM',
      type: 'text',
    },
    {
      id: '6',
      sender: sampleUsers[0], // Me
      content: 'Sounds good! 👍',
      timestamp: '9:43 AM',
      type: 'text',
    },
  ],
};

// Sample iMessage conversation
export const imessageConversation: ChatConfig = {
  platform: 'imessage',
  users: [
    { id: 'me', name: 'Me', isMe: true },
    { id: 'john', name: 'John', isMe: false },
  ],
  typingDuration: 45,
  messageDelay: 30,
  initialDelay: 30,
  messages: [
    {
      id: '1',
      sender: { id: 'john', name: 'John', isMe: false },
      content: 'Are you coming to the party tonight?',
      timestamp: '7:30 PM',
      type: 'text',
    },
    {
      id: '2',
      sender: { id: 'me', name: 'Me', isMe: true },
      content: "Yes! What time does it start?",
      timestamp: '7:31 PM',
      type: 'text',
    },
    {
      id: '3',
      sender: { id: 'john', name: 'John', isMe: false },
      content: "8 PM. Don't be late!",
      timestamp: '7:31 PM',
      type: 'text',
    },
    {
      id: '4',
      sender: { id: 'me', name: 'Me', isMe: true },
      content: "I'll be there 🎊",
      timestamp: '7:32 PM',
      type: 'text',
    },
  ],
};

// Sample Messenger conversation
export const messengerConversation: ChatConfig = {
  platform: 'messenger',
  users: [
    { id: 'me', name: 'Me', isMe: true },
    { id: 'sarah', name: 'Sarah', isMe: false },
  ],
  typingDuration: 45,
  messageDelay: 30,
  initialDelay: 30,
  messages: [
    {
      id: '1',
      sender: { id: 'sarah', name: 'Sarah', isMe: false },
      content: 'Just finished the project!',
      timestamp: '3:45 PM',
      type: 'text',
    },
    {
      id: '2',
      sender: { id: 'me', name: 'Me', isMe: true },
      content: 'Amazing work! How long did it take?',
      timestamp: '3:46 PM',
      type: 'text',
    },
    {
      id: '3',
      sender: { id: 'sarah', name: 'Sarah', isMe: false },
      content: 'About 3 hours. The new tools really helped speed things up',
      timestamp: '3:47 PM',
      type: 'text',
    },
    {
      id: '4',
      sender: { id: 'me', name: 'Me', isMe: true },
      content: "That's impressive! Can't wait to see the final result",
      timestamp: '3:47 PM',
      type: 'text',
    },
  ],
};

// Function to calculate required duration based on messages
export function calculateDuration(config: ChatConfig, fps: number = 30): number {
  let totalFrames = config.initialDelay;

  config.messages.forEach((message) => {
    if (!message.sender.isMe) {
      totalFrames += config.typingDuration + config.messageDelay;
    } else {
      totalFrames += config.messageDelay;
    }
  });

  // Add some buffer at the end
  totalFrames += fps * 2; // 2 seconds at the end

  return totalFrames;
}
