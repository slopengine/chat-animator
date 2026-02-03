import React from 'react';
import { Img } from 'remotion';
import { ChatPlatform, ThemeColors, User } from '../types';

interface ChatHeaderProps {
  platform: ChatPlatform;
  theme: ThemeColors;
  otherUser: User;
  /** Custom title (for group chats) */
  title?: string;
  /** Custom subtitle (for group chats shows member names) */
  subtitle?: string;
  /** Is this a group chat */
  isGroupChat?: boolean;
  /** Group avatar (emoji or image) */
  groupAvatar?: string;
}

/**
 * Chat header matching WhatsApp's exact design from Figma.
 * Features:
 * - Back arrow
 * - Avatar (circular, editable via props)
 * - Contact/group name with proper font
 * - Status/member list
 * - Video call and phone call icons (accurate SVGs)
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

  // Main header container (below status bar)
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: isWhatsApp ? '12px 16px 12px 8px' : '12px 16px',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    minHeight: isWhatsApp ? 72 : 44,
    borderBottom: '1px solid #E9EDEF',
  };

  const avatarSize = isWhatsApp ? 80 : 36;

  const avatarStyle: React.CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: '50%',
    backgroundColor: '#DFE5E7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8696A0',
    fontSize: isWhatsApp ? 32 : 14,
    fontWeight: 500,
    overflow: 'hidden',
    flexShrink: 0,
  };

  // Default avatar icon (person silhouette) - matches WhatsApp
  const renderDefaultAvatar = () => (
    <svg width={avatarSize * 0.6} height={avatarSize * 0.6} viewBox="0 0 24 24" fill="#8696A0">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  const renderAvatar = () => {
    // Group chat with emoji avatar
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

  // Back arrow - matches WhatsApp exactly
  const renderBackButton = () => {
    if (platform === 'whatsapp') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 4, padding: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
              fill="#000000"
            />
          </svg>
        </div>
      );
    }
    return null;
  };

  // Video call icon - accurate WhatsApp style
  const renderVideoIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
        fill="#54656F"
      />
    </svg>
  );

  // Phone call icon - accurate WhatsApp style  
  const renderPhoneIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill="#54656F"
      />
    </svg>
  );

  return (
    <div style={headerStyle}>
      {renderBackButton()}
      {renderAvatar()}
      
      {/* Name and status */}
      <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
        <div
          style={{
            fontSize: isWhatsApp ? 36 : 16,
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
              fontSize: isWhatsApp ? 26 : 12, 
              color: '#667781',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            {displaySubtitle}
          </div>
        )}
      </div>

      {/* Action icons */}
      {platform === 'whatsapp' && (
        <div style={{ display: 'flex', gap: 20, flexShrink: 0, alignItems: 'center' }}>
          {renderVideoIcon()}
          {renderPhoneIcon()}
        </div>
      )}
    </div>
  );
};
