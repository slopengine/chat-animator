# Chat Animator

An animated chat screenshot maker built with [Remotion](https://remotion.dev/). Create realistic animated chat conversations that look like they're happening in real-time, with typing indicators and message animations.

## Features

- **Multiple Platforms**: WhatsApp, iMessage, and Messenger themes
- **Typing Indicators**: Animated three-dot typing indicator before messages appear
- **Smooth Animations**: Messages slide in with spring physics
- **Phone Frame**: Optional realistic iPhone-style frame
- **Multiple Formats**: Portrait (Stories/Reels), Square (Instagram), Landscape (YouTube)
- **Easy Configuration**: Simple helper function to create conversations

## Getting Started

### Install Dependencies

```bash
npm install
```

### Start Remotion Studio

```bash
npm start
```

This opens the Remotion Studio at http://localhost:3000 where you can preview all animations.

### Render Videos

```bash
# Render WhatsApp animation
npm run build

# Render iMessage animation
npm run build:imessage

# Render Messenger animation
npm run build:messenger

# Render all
npm run build:all
```

## Creating Custom Conversations

Use the `createChat` helper for easy conversation creation:

```typescript
import { createChat, getAnimationDuration } from './utils';

const myChat = createChat({
  platform: 'whatsapp', // or 'imessage' or 'messenger'
  otherPersonName: 'Alice',
  conversation: [
    'Hey! How are you?',           // Message from Alice
    '> I am doing great!',          // Your reply (prefix with >)
    'That is wonderful to hear!',   // Another message from Alice
    '> Thanks for asking!',         // Your reply
  ],
  typingDuration: 45,  // Optional: frames for typing indicator (default: 45)
  messageDelay: 30,    // Optional: frames between messages (default: 30)
  initialDelay: 30,    // Optional: frames before first message (default: 30)
});
```

Then add it to `src/Root.tsx`:

```typescript
<Composition
  id="MyCustomChat"
  component={ChatAnimation}
  durationInFrames={getAnimationDuration(myChat, 30)}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{
    config: myChat,
    showPhoneFrame: true,
  }}
/>
```

## Configuration Options

### Chat Platforms

- `whatsapp` - Dark theme with green bubbles
- `imessage` - Light theme with blue bubbles
- `messenger` - Light theme with blue bubbles, Facebook style

### Animation Timing

At 30 FPS:
- `typingDuration: 45` = 1.5 seconds of typing indicator
- `messageDelay: 30` = 1 second between messages
- `initialDelay: 30` = 1 second before first message

### Video Formats

| Format | Width | Height | Use Case |
|--------|-------|--------|----------|
| Portrait | 1080 | 1920 | Instagram Stories, TikTok, Reels |
| Square | 1080 | 1080 | Instagram Feed |
| Landscape | 1920 | 1080 | YouTube, Twitter |
| No Frame | 390 | 844 | Embedding in other videos |

## Project Structure

```
src/
├── components/
│   ├── ChatBubble.tsx      # Message bubble with animations
│   ├── TypingIndicator.tsx # Animated typing dots
│   ├── ChatHeader.tsx      # Chat header with avatar
│   ├── PhoneFrame.tsx      # iPhone-style frame
│   └── InputBar.tsx        # Bottom input bar
├── compositions/
│   └── ChatAnimation.tsx   # Main composition
├── utils/
│   └── createChat.ts       # Helper functions
├── types.ts                # TypeScript interfaces
├── sampleData.ts           # Example conversations
├── Root.tsx                # Remotion composition registry
└── index.ts                # Entry point
```

## Customization

### Theme Colors

Edit `src/types.ts` to customize colors:

```typescript
export const platformThemes: Record<ChatPlatform, ThemeColors> = {
  whatsapp: {
    background: '#0b141a',
    sentBubble: '#005c4b',
    receivedBubble: '#202c33',
    // ... more colors
  },
  // ...
};
```

### Animation Physics

Edit `src/components/ChatBubble.tsx` to adjust spring physics:

```typescript
const scale = spring({
  frame: relativeFrame,
  fps,
  config: {
    damping: 12,      // Higher = less bouncy
    stiffness: 200,   // Higher = faster
    mass: 0.5,        // Higher = slower
  },
});
```

## Rendering

### MP4 Video

```bash
npx remotion render CustomWhatsApp out/custom.mp4
```

### GIF

```bash
npx remotion render CustomWhatsApp out/custom.gif --image-format=png
```

### Different Quality

```bash
# High quality (slower)
npx remotion render CustomWhatsApp out/custom.mp4 --crf 18

# Lower quality (faster, smaller file)
npx remotion render CustomWhatsApp out/custom.mp4 --crf 28
```

## License

MIT
