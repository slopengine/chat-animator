import { z } from 'zod';

// Message input schema - each message in the conversation
export const messageSchema = z.object({
  id: z.string().describe('Message ID'),
  text: z.string().describe('Message text'),
  isMe: z.boolean().describe('Sent by me?'),
  timestamp: z.string().optional().describe('Time (e.g., 9:41 AM)'),
});

// Main chat schema for the editable composition
export const chatSchema = z.object({
  // Contact info - who you're chatting with
  contactName: z.string().describe('Contact name'),
  contactAvatar: z.string().describe('Contact photo URL (or leave empty)'),

  // Your profile
  myAvatar: z.string().describe('Your photo URL (optional)'),

  // Appearance
  platform: z.enum(['whatsapp', 'imessage', 'messenger']).describe('App style'),
  showPhoneFrame: z.boolean().describe('Show phone frame'),

  // Animation timing (1 = slow, 10 = fast)
  typingSpeed: z.number().min(1).max(10).describe('Typing speed'),
  messageSpeed: z.number().min(1).max(10).describe('Message delay'),

  // The conversation
  messages: z.array(messageSchema).describe('Messages'),
});

export type ChatSchema = z.infer<typeof chatSchema>;
export type MessageSchema = z.infer<typeof messageSchema>;
