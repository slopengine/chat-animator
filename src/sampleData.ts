import { ChatConfig, User, groupChatColors } from './types';

// Sample users - matching Figma design
export const anikaShavan: User = {
  id: 'anika',
  name: 'Anika Shavan',
  isMe: false,
};

export const me: User = {
  id: 'me',
  name: 'Me',
  isMe: true,
};

// Group chat users (from Figma "Lunch Club")
export const jordan: User = {
  id: 'jordan',
  name: 'Jordan',
  isMe: false,
  nameColor: groupChatColors[0], // Pink
};

export const moshe: User = {
  id: 'moshe',
  name: 'Moshe',
  isMe: false,
  nameColor: groupChatColors[1], // Teal
};

// Sample WhatsApp conversation - matching Figma "Chat A"
export const whatsappConversation: ChatConfig = {
  platform: 'whatsapp',
  users: [me, anikaShavan],
  chatTitle: 'Anika Shavan',
  chatSubtitle: 'online',
  typingDuration: 45,
  messageDelay: 30,
  initialDelay: 30,
  messages: [
    {
      id: '1',
      sender: anikaShavan,
      content: '10am coffee?',
      timestamp: '11:53',
      type: 'text',
    },
    {
      id: '2',
      sender: me,
      content: 'Needed! at the usual? ☕',
      timestamp: '11:59',
      type: 'text',
    },
    {
      id: '3',
      sender: anikaShavan,
      content: 'See you there',
      timestamp: '12:04',
      type: 'text',
    },
  ],
};

// Sample WhatsApp conversation B - more messages
export const whatsappConversationB: ChatConfig = {
  platform: 'whatsapp',
  users: [me, anikaShavan],
  chatTitle: 'Anika Shavan',
  chatSubtitle: 'online',
  typingDuration: 45,
  messageDelay: 30,
  initialDelay: 30,
  messages: [
    {
      id: '1',
      sender: me,
      content: 'Have you watched any of it?',
      timestamp: '11:50',
      type: 'text',
    },
    {
      id: '2',
      sender: anikaShavan,
      content: 'Yeah that show is great',
      timestamp: '11:53',
      type: 'text',
    },
    {
      id: '3',
      sender: me,
      content: 'Needed! at the usual? ☕',
      timestamp: '11:59',
      type: 'text',
    },
    {
      id: '4',
      sender: anikaShavan,
      content: 'Free to meet up this week?',
      timestamp: '09:53',
      type: 'text',
    },
    {
      id: '5',
      sender: me,
      content: "Yeah, I'm free most days. What did you have in mind?",
      timestamp: '10:59',
      type: 'text',
    },
    {
      id: '6',
      sender: anikaShavan,
      content: 'I was thinking we could grab coffee at that new cafe',
      timestamp: '11:02',
      type: 'text',
    },
    {
      id: '7',
      sender: me,
      content: "Sounds great! I've heard good things about it the Matcha",
      timestamp: '10:59',
      type: 'text',
    },
    {
      id: '8',
      sender: anikaShavan,
      content: "How about Wednesday afternoon? I'm free after 2 PM",
      timestamp: '11:35',
      type: 'text',
    },
    {
      id: '9',
      sender: me,
      content: 'Sure',
      timestamp: '10:59',
      type: 'text',
    },
  ],
};

// Sample Group Chat - matching Figma "Lunch Club"
export const groupChatConversation: ChatConfig = {
  platform: 'whatsapp',
  users: [me, jordan, moshe],
  chatTitle: 'Lunch Club',
  chatSubtitle: 'Jordan, Moshe, You',
  isGroupChat: true,
  typingDuration: 45,
  messageDelay: 30,
  initialDelay: 30,
  messages: [
    {
      id: 'system-1',
      sender: jordan,
      content: '',
      systemText: 'Jordan created this group',
      timestamp: '',
      type: 'system',
    },
    {
      id: '1',
      sender: jordan,
      content: "Let's kick this thing off. Pizza tomorrow??",
      timestamp: '11:53',
      type: 'text',
    },
    {
      id: '2',
      sender: me,
      content: "I'm free. Would love to see you both!",
      timestamp: '11:53',
      type: 'text',
    },
    {
      id: '3',
      sender: moshe,
      content: '',
      timestamp: '11:53',
      type: 'gif',
      imageUrl: 'https://media.giphy.com/media/3o7TKsQ8UzvLZHTyJK/giphy.gif',
      reactions: ['👀'],
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

// Legacy exports for backwards compatibility
export const sampleUsers: User[] = [me, anikaShavan];

// Function to calculate required duration based on messages
export function calculateDuration(config: ChatConfig, fps: number = 30): number {
  let totalFrames = config.initialDelay;

  config.messages.forEach((message) => {
    if (message.type === 'system') {
      totalFrames += config.messageDelay / 2;
      return;
    }
    
    if (!message.sender.isMe) {
      totalFrames += config.typingDuration + config.messageDelay;
    } else {
      totalFrames += config.messageDelay;
    }
  });

  // Add some buffer at the end
  totalFrames += fps * 2;

  return totalFrames;
}
