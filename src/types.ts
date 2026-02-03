export type ChatPlatform = 'whatsapp' | 'imessage' | 'messenger';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isMe: boolean;
  /** Color for sender name in group chats */
  nameColor?: string;
}

export interface ChatMessage {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'gif' | 'system';
  imageUrl?: string;
  replyTo?: string;
  /** For system messages like "Jordan created this group" */
  systemText?: string;
  /** Emoji reactions on the message */
  reactions?: string[];
}

export interface ChatConfig {
  platform: ChatPlatform;
  messages: ChatMessage[];
  users: User[];
  /** Chat title (contact name or group name) */
  chatTitle?: string;
  /** Subtitle (online status or group members) */
  chatSubtitle?: string;
  /** Is this a group chat */
  isGroupChat?: boolean;
  // Animation timing (in frames)
  typingDuration: number;
  messageDelay: number;
  initialDelay: number;
}

// Schema for Remotion Studio input
export interface ChatInputSchema {
  platform: ChatPlatform;
  contactName: string;
  contactAvatar: string;
  myAvatar: string;
  showPhoneFrame: boolean;
  typingSpeed: number;
  messageSpeed: number;
  messages: MessageInput[];
}

export interface MessageInput {
  id: string;
  text: string;
  isMe: boolean;
  timestamp?: string;
}

export interface ThemeColors {
  // Background
  background: string;
  backgroundWallpaper: string;
  doodlePattern: string;
  
  // Header
  headerBg: string;
  headerText: string;
  headerSubtext: string;
  
  // Bubbles
  sentBubble: string;
  sentText: string;
  receivedBubble: string;
  receivedText: string;
  
  // Timestamps & meta
  timestamp: string;
  timestampOpacity: number;
  readReceipt: string;
  
  // System messages
  systemBubble: string;
  systemBubbleOpacity: number;
  systemText: string;
  
  // E2E encryption notice
  e2eBubble: string;
  e2eText: string;
  
  // Date separator
  dateSeparatorBg: string;
  dateSeparatorText: string;
  
  // Typing indicator
  typingIndicator: string;
  
  // Input bar
  inputBarBg: string;
  inputFieldBg: string;
  inputPlaceholder: string;
  inputIcon: string;
}

// Exact colors from Figma design
export const platformThemes: Record<ChatPlatform, ThemeColors> = {
  whatsapp: {
    // Background - from Figma
    background: '#F5F1EB',
    backgroundWallpaper: '#F5F1EB',
    doodlePattern: '#EAE0D3',
    
    // Header
    headerBg: '#FFFFFF',
    headerText: '#111B21',
    headerSubtext: '#667781',
    
    // Bubbles - exact Figma values
    sentBubble: '#D9FDD3',           // Color/Product Systems/Bubble Surface Outgoing
    sentText: '#0A1014',             // Color/Content/Default
    receivedBubble: '#FFFFFF',       // Color/Product Systems/Bubble Surface Incoming
    receivedText: '#0A1014',         // Color/Content/Default
    
    // Timestamps & meta
    timestamp: '#111B21',            // Color/Product Systems/Bubble Content Deemphasized
    timestampOpacity: 0.7,           // 70% opacity from Figma
    readReceipt: '#53BDEB',          // WhatsApp blue checkmarks (slightly different from #007BFC)
    
    // System messages
    systemBubble: '#FFFFFF',         // Color/Product Systems/Bubble Surface System
    systemBubbleOpacity: 0.9,        // 90% opacity
    systemText: '#54656F',
    
    // E2E encryption notice
    e2eBubble: '#FFF0D4',            // Color/Product Systems/Bubble Surface E2E
    e2eText: '#5B6368',              // Color/Product Systems/Bubble Content E2E
    
    // Date separator
    dateSeparatorBg: '#FFFFFF',
    dateSeparatorText: '#54656F',
    
    // Typing indicator
    typingIndicator: '#667781',
    
    // Input bar
    inputBarBg: '#F0F2F5',
    inputFieldBg: '#FFFFFF',
    inputPlaceholder: '#667781',
    inputIcon: '#54656F',
  },
  imessage: {
    background: '#FFFFFF',
    backgroundWallpaper: '#FFFFFF',
    doodlePattern: '#FFFFFF',
    headerBg: '#F6F6F6',
    headerText: '#000000',
    headerSubtext: '#8E8E93',
    sentBubble: '#007AFF',
    sentText: '#FFFFFF',
    receivedBubble: '#E9E9EB',
    receivedText: '#000000',
    timestamp: '#8E8E93',
    timestampOpacity: 1,
    readReceipt: '#007AFF',
    systemBubble: '#E9E9EB',
    systemBubbleOpacity: 1,
    systemText: '#8E8E93',
    e2eBubble: '#E9E9EB',
    e2eText: '#8E8E93',
    dateSeparatorBg: '#E9E9EB',
    dateSeparatorText: '#8E8E93',
    typingIndicator: '#8E8E93',
    inputBarBg: '#F6F6F6',
    inputFieldBg: '#FFFFFF',
    inputPlaceholder: '#8E8E93',
    inputIcon: '#007AFF',
  },
  messenger: {
    background: '#FFFFFF',
    backgroundWallpaper: '#FFFFFF',
    doodlePattern: '#FFFFFF',
    headerBg: '#FFFFFF',
    headerText: '#050505',
    headerSubtext: '#65676B',
    sentBubble: '#0084FF',
    sentText: '#FFFFFF',
    receivedBubble: '#E4E6EB',
    receivedText: '#050505',
    timestamp: '#65676B',
    timestampOpacity: 1,
    readReceipt: '#0084FF',
    systemBubble: '#E4E6EB',
    systemBubbleOpacity: 1,
    systemText: '#65676B',
    e2eBubble: '#E4E6EB',
    e2eText: '#65676B',
    dateSeparatorBg: '#E4E6EB',
    dateSeparatorText: '#65676B',
    typingIndicator: '#65676B',
    inputBarBg: '#FFFFFF',
    inputFieldBg: '#F0F2F5',
    inputPlaceholder: '#65676B',
    inputIcon: '#0084FF',
  },
};

// Group chat sender name colors (from WhatsApp)
export const groupChatColors = [
  '#E91E63', // Pink (like Jordan in Figma)
  '#00BFA5', // Teal
  '#FF5722', // Deep Orange  
  '#673AB7', // Deep Purple
  '#2196F3', // Blue
  '#FF9800', // Orange
  '#4CAF50', // Green
  '#9C27B0', // Purple
];
