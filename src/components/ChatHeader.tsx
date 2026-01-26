import React from 'react';
import { ChatPlatform, ThemeColors, User } from '../types';

interface ChatHeaderProps {
  platform: ChatPlatform;
  theme: ThemeColors;
  otherUser: User;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  platform,
  theme,
  otherUser,
}) => {
  const isWhatsApp = platform === 'whatsapp';

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: isWhatsApp ? '20px 24px' : '12px 16px',
    backgroundColor: theme.headerBg,
    borderBottom: '2px solid #e9edef',
    flexShrink: 0,
    minHeight: isWhatsApp ? 120 : 44,
  };

  const avatarSize = isWhatsApp ? 90 : 36;

  const avatarStyle: React.CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: '50%',
    backgroundColor: '#dfe5e7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8696a0',
    fontSize: isWhatsApp ? 18 : 14,
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
    <svg width={avatarSize * 0.6} height={avatarSize * 0.6} viewBox="0 0 24 24" fill="#8696a0">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  const renderBackButton = () => {
    if (platform === 'whatsapp') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 12 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
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
            color: '#007aff',
            fontSize: 17,
            marginRight: 8,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path
              d="M10 2L2 10L10 18"
              stroke="#007aff"
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

  const renderStatus = () => {
    if (platform === 'whatsapp') {
      return (
        <div style={{ fontSize: 28, color: '#667781', marginTop: 2 }}>
          {otherUser.name.split(' ')[0]}
        </div>
      );
    }
    if (platform === 'messenger') {
      return (
        <div style={{ fontSize: 12, color: theme.timestamp }}>Active now</div>
      );
    }
    return null;
  };

  return (
    <div style={headerStyle}>
      {renderBackButton()}
      <div style={avatarStyle}>
        {otherUser.avatar ? (
          <img
            src={otherUser.avatar}
            alt={otherUser.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          renderDefaultAvatar()
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, marginLeft: 20 }}>
        <div
          style={{
            fontSize: isWhatsApp ? 38 : 16,
            fontWeight: 500,
            color: theme.headerText,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {otherUser.name}
        </div>
        {renderStatus()}
      </div>
      {platform === 'whatsapp' && (
        <div style={{ display: 'flex', gap: 32, flexShrink: 0, alignItems: 'center' }}>
          {/* Phone icon */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill="#54656f"
            />
          </svg>
        </div>
      )}
      {platform === 'messenger' && (
        <div style={{ display: 'flex', gap: 16 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill="#0084ff"
            />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
              fill="#0084ff"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
