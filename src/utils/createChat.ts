import { ChatConfig, ChatMessage, ChatPlatform, User } from '../types';

interface CreateChatOptions {
  platform: ChatPlatform;
  /** Name of the other person in the chat */
  otherPersonName: string;
  /** Optional avatar URL for the other person */
  otherPersonAvatar?: string;
  /** Messages as simple strings. Prefix with ">" for your messages, no prefix for the other person */
  conversation: string[];
  /** Duration of typing indicator in frames (default: 45 at 30fps = 1.5s) */
  typingDuration?: number;
  /** Delay between messages in frames (default: 30 at 30fps = 1s) */
  messageDelay?: number;
  /** Initial delay before first message in frames (default: 30) */
  initialDelay?: number;
}

/**
 * Helper function to easily create a chat configuration from a simple conversation array.
 *
 * @example
 * ```ts
 * const config = createChat({
 *   platform: 'whatsapp',
 *   otherPersonName: 'Alice',
 *   conversation: [
 *     'Hey, how are you?',      // Message from Alice
 *     '> I am good, thanks!',    // Your reply (prefixed with >)
 *     'That is great to hear!',  // Another message from Alice
 *   ],
 * });
 * ```
 */
export function createChat(options: CreateChatOptions): ChatConfig {
  const {
    platform,
    otherPersonName,
    otherPersonAvatar,
    conversation,
    typingDuration = 45,
    messageDelay = 30,
    initialDelay = 30,
  } = options;

  const me: User = {
    id: 'me',
    name: 'Me',
    isMe: true,
  };

  const other: User = {
    id: 'other',
    name: otherPersonName,
    avatar: otherPersonAvatar,
    isMe: false,
  };

  const now = new Date();
  let minuteOffset = 0;

  const messages: ChatMessage[] = conversation.map((text, index) => {
    const isMe = text.startsWith('>');
    const content = isMe ? text.slice(1).trim() : text;

    // Increment time occasionally
    if (index > 0 && index % 2 === 0) {
      minuteOffset++;
    }

    const time = new Date(now.getTime() + minuteOffset * 60000);
    const timestamp = time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      id: `msg-${index}`,
      sender: isMe ? me : other,
      content,
      timestamp,
      type: 'text' as const,
    };
  });

  return {
    platform,
    users: [me, other],
    messages,
    typingDuration,
    messageDelay,
    initialDelay,
  };
}

/**
 * Calculate the total duration needed for a chat animation in frames.
 */
export function getAnimationDuration(config: ChatConfig, fps: number = 30): number {
  let totalFrames = config.initialDelay;

  config.messages.forEach((message) => {
    if (!message.sender.isMe) {
      totalFrames += config.typingDuration + config.messageDelay;
    } else {
      totalFrames += config.messageDelay;
    }
  });

  // Add buffer at the end
  totalFrames += fps * 2;

  return totalFrames;
}
