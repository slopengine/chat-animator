import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '@remotion/player';
import { EditableChatAnimation, calculateEditableDuration } from '../compositions/EditableChatAnimation';
import { ChatSchema } from '../schema';

const FPS = 30;

type Platform = 'whatsapp' | 'imessage' | 'messenger';
type AspectRatio = 'portrait' | 'square' | 'landscape';

const defaultMessages = [
  { id: '1', text: 'Hey! How are you doing?', isMe: false, timestamp: '9:41 AM' },
  { id: '2', text: 'I am great, thanks for asking!', isMe: true, timestamp: '9:41 AM' },
  { id: '3', text: 'Want to grab coffee later?', isMe: false, timestamp: '9:42 AM' },
  { id: '4', text: 'Sure! What time works for you?', isMe: true, timestamp: '9:42 AM' },
  { id: '5', text: 'How about 3pm at the usual place?', isMe: false, timestamp: '9:43 AM' },
  { id: '6', text: 'Perfect, see you there! ☕', isMe: true, timestamp: '9:43 AM' },
];

const aspectRatios: Record<AspectRatio, { width: number; height: number }> = {
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  landscape: { width: 1920, height: 1080 },
};

function App() {
  const [platform, setPlatform] = useState<Platform>('whatsapp');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('portrait');

  const props: ChatSchema = useMemo(() => ({
    platform,
    contactName: 'Alice',
    contactAvatar: '',
    myAvatar: '',
    showPhoneFrame: true,
    typingSpeed: 5,
    messageSpeed: 5,
    messages: defaultMessages,
  }), [platform]);

  const duration = useMemo(() => 
    calculateEditableDuration(props.messages, props.typingSpeed, props.messageSpeed, FPS),
    [props]
  );

  const { width, height } = aspectRatios[aspectRatio];
  const scale = Math.min(400 / width, 700 / height);

  return (
    <>
      <h1>💬 Chat Animator</h1>
      
      <div className="controls">
        <div>
          {(['whatsapp', 'imessage', 'messenger'] as Platform[]).map((p) => (
            <button
              key={p}
              className={platform === p ? 'active' : ''}
              onClick={() => setPlatform(p)}
              style={{ marginRight: '0.5rem' }}
            >
              {p === 'whatsapp' ? '📱 WhatsApp' : p === 'imessage' ? '💬 iMessage' : '💭 Messenger'}
            </button>
          ))}
        </div>
        <div>
          {(['portrait', 'square', 'landscape'] as AspectRatio[]).map((ar) => (
            <button
              key={ar}
              className={aspectRatio === ar ? 'active' : ''}
              onClick={() => setAspectRatio(ar)}
              style={{ marginRight: '0.5rem' }}
            >
              {ar === 'portrait' ? '📱 9:16' : ar === 'square' ? '⬜ 1:1' : '🖥️ 16:9'}
            </button>
          ))}
        </div>
      </div>

      <div className="player-container">
        <Player
          component={EditableChatAnimation}
          inputProps={props}
          durationInFrames={duration}
          fps={FPS}
          compositionWidth={width}
          compositionHeight={height}
          style={{
            width: width * scale,
            height: height * scale,
          }}
          controls
          autoPlay
          loop
        />
      </div>

      <p style={{ color: '#666', marginTop: '1rem', textAlign: 'center' }}>
        Use <a href="https://www.remotion.dev/docs/studio" target="_blank" style={{ color: '#25D366' }}>Remotion Studio</a> for full editing & export
      </p>
    </>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
