import React from 'react';
import { ChatPlatform, ThemeColors } from '../types';

interface InputBarProps {
  platform: ChatPlatform;
  theme: ThemeColors;
}

/**
 * Chat input bar matching WhatsApp's exact design from Figma.
 * Features:
 * - Plus button for attachments
 * - Message input field with emoji button inside
 * - Camera button
 * - Microphone button for voice messages
 */
export const InputBar: React.FC<InputBarProps> = ({ platform, theme }) => {
  const isWhatsApp = platform === 'whatsapp';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: isWhatsApp ? '12px 16px' : '8px 12px',
    gap: 12,
    backgroundColor: theme.inputBarBg,
    borderTop: platform !== 'whatsapp' ? '1px solid #E5E5E5' : 'none',
    flexShrink: 0,
  };

  const inputContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: isWhatsApp ? '14px 20px' : '10px 16px',
    borderRadius: 42,
    border: 'none',
    backgroundColor: theme.inputFieldBg,
    gap: 14,
  };

  const inputTextStyle: React.CSSProperties = {
    flex: 1,
    color: theme.inputPlaceholder,
    fontSize: isWhatsApp ? 30 : 15,
  };

  if (platform === 'whatsapp') {
    return (
      <div style={containerStyle}>
        {/* Plus icon */}
        <div style={{ padding: '6px', display: 'flex', alignItems: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke={theme.inputIcon}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Input field container */}
        <div style={inputContainerStyle}>
          <div style={inputTextStyle}>Message</div>

          {/* Sticker/emoji icon inside input */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              fill="#8696A0"
            />
            <path
              d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
              fill="#8696A0"
            />
          </svg>
        </div>

        {/* Camera icon */}
        <div style={{ padding: '6px', display: 'flex', alignItems: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"
              fill={theme.inputIcon}
            />
            <path
              d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
              fill={theme.inputIcon}
            />
          </svg>
        </div>

        {/* Microphone icon */}
        <div style={{ padding: '6px', display: 'flex', alignItems: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
              fill={theme.inputIcon}
            />
          </svg>
        </div>
      </div>
    );
  }

  // iMessage / Messenger style
  return (
    <div style={containerStyle}>
      {platform === 'messenger' && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={theme.inputIcon} strokeWidth="2" fill="none" />
          <path d="M12 8v8M8 12h8" stroke={theme.inputIcon} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <div style={inputContainerStyle}>
        <div style={inputTextStyle}>
          {platform === 'imessage' ? 'iMessage' : 'Aa'}
        </div>
      </div>
      {platform === 'imessage' ? (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: theme.inputIcon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M8 2l6 6-6 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill={theme.inputIcon} />
        </svg>
      )}
    </div>
  );
};
