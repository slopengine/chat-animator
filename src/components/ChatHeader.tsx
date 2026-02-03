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
 * - Avatar (circular, with fallback to initials)
 * - Contact/group name
 * - Status/member list
 * - Video call and phone call icons
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
    padding: isWhatsApp ? '16px 20px' : '12px 16px',
    backgroundColor: theme.headerBg,
    borderBottom: '1px solid #E9EDEF',
    flexShrink: 0,
    minHeight: isWhatsApp ? 100 : 44,
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Default avatar icon (person silhouette)
  const renderDefaultAvatar = () => (
    <svg width={avatarSize * 0.55} height={avatarSize * 0.55} viewBox="0 0 24 24" fill="#8696A0">
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

  const renderBackButton = () => {
    if (platform === 'whatsapp') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
              fill={theme.headerText}
            />
          </svg>
        </div>
      );
    }
    if (platform === 'imessage') {
      return (
        <div
          style={{
            color: '#007AFF',
            fontSize: 17,
            marginRight: 8,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path
              d="M10 2L2 10L10 18"
              stroke="#007AFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={headerStyle}>
      {renderBackButton()}
      {renderAvatar()}
      <div style={{ flex: 1, minWidth: 0, marginLeft: 16 }}>
        <div
          style={{
            fontSize: isWhatsApp ? 34 : 16,
            fontWeight: 500,
            color: theme.headerText,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {displayTitle}
        </div>
        {displaySubtitle && (
          <div 
            style={{ 
              fontSize: isWhatsApp ? 24 : 12, 
              color: theme.headerSubtext, 
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displaySubtitle}
          </div>
        )}
      </div>
      {platform === 'whatsapp' && (
        <div style={{ display: 'flex', gap: 28, flexShrink: 0, alignItems: 'center' }}>
          {/* Video call icon */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
              fill="#54656F"
            />
          </svg>
          {/* Phone call icon */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill="#54656F"
            />
          </svg>
        </div>
      )}
      {platform === 'messenger' && (
        <div style={{ display: 'flex', gap: 16 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill="#0084FF"
            />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
              fill="#0084FF"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
