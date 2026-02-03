import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// MESSAGE SCHEMA - Each message in the conversation
// ═══════════════════════════════════════════════════════════════════

export const messageSchema = z.object({
  id: z
    .string()
    .describe('🆔 Message ID (unique identifier)'),
  
  text: z
    .string()
    .describe('💬 Message Text'),
  
  isMe: z
    .boolean()
    .default(false)
    .describe('👤 Sent by me? (ON = your message, OFF = their message)'),
  
  timestamp: z
    .string()
    .default('')
    .describe('🕐 Time (e.g., "9:41 AM" or "14:30")'),
  
  showDateBefore: z
    .string()
    .optional()
    .describe('📅 Date separator (e.g., "Mon 12 May" - shows above this message)'),
  
  // ─────────────────────────────────────────────────────────────────
  // 🎬 TIMELINE TIMING (optional - used by timeline editor)
  // ─────────────────────────────────────────────────────────────────
  
  startFrame: z
    .number()
    .optional()
    .describe('🎬 Start frame (when message appears in timeline)'),
  
  duration: z
    .number()
    .optional()
    .describe('⏱️ Duration in frames (how long message is visible - 0 = until end)'),
});

// ═══════════════════════════════════════════════════════════════════
// MAIN CHAT SCHEMA - All configurable props
// ═══════════════════════════════════════════════════════════════════

export const chatSchema = z.object({
  // ─────────────────────────────────────────────────────────────────
  // 📱 PLATFORM & STYLE
  // ─────────────────────────────────────────────────────────────────
  
  platform: z
    .enum(['whatsapp', 'imessage', 'messenger'])
    .describe('📱 Chat Platform Style'),
  
  showPhoneFrame: z
    .boolean()
    .default(false)
    .describe('🖼️ Show iPhone frame around the chat'),
  
  showEncryptionNotice: z
    .boolean()
    .default(true)
    .describe('🔒 Show "Messages are end-to-end encrypted" notice'),

  // ─────────────────────────────────────────────────────────────────
  // 👥 PROFILES
  // ─────────────────────────────────────────────────────────────────
  
  contactName: z
    .string()
    .default('Contact Name')
    .describe('👤 Contact Name (shown in header)'),
  
  contactAvatar: z
    .string()
    .default('')
    .describe('🖼️ Contact Photo URL (leave empty for default avatar)'),
  
  myAvatar: z
    .string()
    .default('')
    .describe('🤳 Your Photo URL (optional, for group chats)'),

  // ─────────────────────────────────────────────────────────────────
  // ⚡ ANIMATION SPEED
  // ─────────────────────────────────────────────────────────────────
  
  typingSpeed: z
    .number()
    .min(1)
    .max(10)
    .step(1)
    .default(5)
    .describe('⌨️ Typing Speed (1 = slow, 10 = fast)'),
  
  messageSpeed: z
    .number()
    .min(1)
    .max(10)
    .step(1)
    .default(5)
    .describe('💨 Message Delay (1 = slow pauses, 10 = rapid-fire)'),

  // ─────────────────────────────────────────────────────────────────
  // 💬 CONVERSATION
  // ─────────────────────────────────────────────────────────────────
  
  messages: z
    .array(messageSchema)
    .describe('💬 Messages - Add your conversation here'),
});

export type ChatSchema = z.infer<typeof chatSchema>;
export type MessageSchema = z.infer<typeof messageSchema>;
