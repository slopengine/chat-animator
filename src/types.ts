export type ChatPlatform = 'whatsapp' | 'imessage' | 'messenger';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isMe: boolean;
}

export interface ChatMessage {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  imageUrl?: string;
  replyTo?: string;
}

export interface ChatConfig {
  platform: ChatPlatform;
  messages: ChatMessage[];
  users: User[];
  // Animation timing (in frames)
  typingDuration: number; // How long typing indicator shows
  messageDelay: number; // Delay between messages
  initialDelay: number; // Delay before first message
}

// Schema for Remotion Studio input
export interface ChatInputSchema {
  platform: ChatPlatform;
  contactName: string;
  contactAvatar: string;
  myAvatar: string;
  showPhoneFrame: boolean;
  typingSpeed: number; // 1-10 scale
  messageSpeed: number; // 1-10 scale
  messages: MessageInput[];
}

export interface MessageInput {
  id: string;
  text: string;
  isMe: boolean;
  timestamp?: string;
}

export interface ThemeColors {
  background: string;
  headerBg: string;
  headerText: string;
  sentBubble: string;
  sentText: string;
  receivedBubble: string;
  receivedText: string;
  timestamp: string;
  typingIndicator: string;
}

export const platformThemes: Record<ChatPlatform, ThemeColors> = {
  whatsapp: {
    background: '#efeae2', // Light beige WhatsApp background
    headerBg: '#f0f2f5', // Light gray header (modern WhatsApp)
    headerText: '#111b21', // Dark text
    sentBubble: '#d9fdd3', // Light green for sent messages
    sentText: '#111b21',
    receivedBubble: '#ffffff', // White for received messages
    receivedText: '#111b21',
    timestamp: '#667781',
    typingIndicator: '#667781',
  },
  imessage: {
    background: '#ffffff',
    headerBg: '#f6f6f6',
    headerText: '#000000',
    sentBubble: '#007aff',
    sentText: '#ffffff',
    receivedBubble: '#e9e9eb',
    receivedText: '#000000',
    timestamp: '#8e8e93',
    typingIndicator: '#8e8e93',
  },
  messenger: {
    background: '#ffffff',
    headerBg: '#ffffff',
    headerText: '#050505',
    sentBubble: '#0084ff',
    sentText: '#ffffff',
    receivedBubble: '#e4e6eb',
    receivedText: '#050505',
    timestamp: '#65676b',
    typingIndicator: '#65676b',
  },
};
