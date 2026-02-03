import React from 'react';
import { Img } from 'remotion';
import { ChatPlatform, ThemeColors, User } from '../types';

interface ChatHeaderProps {
  platform: ChatPlatform;
  theme: ThemeColors;
  otherUser: User;
  title?: string;
  subtitle?: string;
  isGroupChat?: boolean;
  groupAvatar?: string;
}

/**
 * Chat header matching WhatsApp Figma design exactly.
 * Uses outline-style icons like the original.
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  platform,
  theme,
  otherUser,
  title,
  subtitle,
  isGroupChat = false,
  groupAvatar,
}) => {
  const isWhatsApp = platform === 'whatsapp';
  const displayTitle = title || otherUser.name;
  const displaySubtitle = subtitle || (isWhatsApp ? 'online' : undefined);

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: isWhatsApp ? '10px 16px 10px 4px' : '12px 16px',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    minHeight: isWhatsApp ? 76 : 44,
  };

  const avatarSize = 100;

  const avatarStyle: React.CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: '50%',
    backgroundColor: '#DFE5E7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const renderDefaultAvatar = () => (
    <svg width={avatarSize * 0.55} height={avatarSize * 0.55} viewBox="0 0 24 24" fill="#8696A0">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  const renderAvatar = () => {
    if (isGroupChat && groupAvatar && !groupAvatar.startsWith('http')) {
      return (
        <div style={avatarStyle}>
          <span style={{ fontSize: avatarSize * 0.5 }}>{groupAvatar}</span>
        </div>
      );
    }

    const avatarUrl = isGroupChat ? groupAvatar : otherUser.avatar;
    
    return (
      <div style={avatarStyle}>
        {avatarUrl ? (
          <Img
            src={avatarUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          renderDefaultAvatar()
        )}
      </div>
    );
  };

  // Back arrow - thin chevron style like Figma (black)
  const renderBackButton = () => {
    if (platform === 'whatsapp') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px 8px 16px' }}>
          <svg width="22" height="36" viewBox="0 0 11 18" fill="none">
            <path
              d="M9 2L2 9L9 16"
              stroke="#000000"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }
    return null;
  };

  // Video call icon - outline style like Figma
  const renderVideoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="14" height="12" rx="2" stroke="#54656F" strokeWidth="1.8" fill="none"/>
      <path d="M16 9.5L21 7V17L16 14.5" stroke="#54656F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );

  // Phone call icon - outline style like Figma
  const renderPhoneIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
        stroke="#54656F"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  return (
    <div style={headerStyle}>
      {renderBackButton()}
      
      {/* Avatar with more left indent */}
      <div style={{ marginLeft: 4 }}>
        {renderAvatar()}
      </div>
      
      {/* Name and status */}
      <div style={{ flex: 1, minWidth: 0, marginLeft: 14 }}>
        <div
          style={{
            fontSize: 38,
            fontWeight: 500,
            color: '#000000',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
        >
          {displayTitle}
        </div>
        {displaySubtitle && (
          <div 
            style={{ 
              fontSize: 28,
              color: '#667781',
              marginTop: 2,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            {displaySubtitle}
          </div>
        )}
      </div>

      {/* Action icons with proper spacing */}
      {platform === 'whatsapp' && (
        <div style={{ display: 'flex', gap: 16, flexShrink: 0, alignItems: 'center', marginRight: 4 }}>
          {renderVideoIcon()}
          {renderPhoneIcon()}
        </div>
      )}
    </div>
  );
};
