import React from 'react';
import { ChatPlatform } from '../types';

interface PhoneFrameProps {
  children: React.ReactNode;
  platform: ChatPlatform;
  width: number;
  height: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  platform,
  width,
  height,
}) => {
  const isWhatsApp = platform === 'whatsapp';

  const frameStyle: React.CSSProperties = {
    width: width,
    height: height,
    backgroundColor: '#1a1a1a',
    borderRadius: 55,
    padding: 14,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  };

  const screenStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: isWhatsApp ? '#efeae2' : '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  };

  // Dynamic Island style notch (modern iPhone)
  const notchStyle: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 160,
    height: 45,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    zIndex: 10,
  };

  const statusBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 36px 16px',
    fontSize: 34,
    fontWeight: 600,
    color: isWhatsApp ? '#000000' : '#000000',
    backgroundColor: isWhatsApp ? '#f0f2f5' : '#f6f6f6',
    flexShrink: 0,
  };

  const timeStyle: React.CSSProperties = {
    marginLeft: 8,
    fontWeight: 600,
  };

  const iconsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const iconColor = '#000000';

  return (
    <div style={frameStyle}>
      <div style={screenStyle}>
        <div style={notchStyle} />
        <div style={statusBarStyle}>
          <div style={timeStyle}>9:41</div>
          <div style={iconsStyle}>
            {/* Signal bars */}
            <svg width="36" height="24" viewBox="0 0 18 12" fill="none">
              <path
                d="M1 7C1 6.45 1.45 6 2 6H3C3.55 6 4 6.45 4 7V11C4 11.55 3.55 12 3 12H2C1.45 12 1 11.55 1 11V7Z"
                fill={iconColor}
              />
              <path
                d="M6 5C6 4.45 6.45 4 7 4H8C8.55 4 9 4.45 9 5V11C9 11.55 8.55 12 8 12H7C6.45 12 6 11.55 6 11V5Z"
                fill={iconColor}
              />
              <path
                d="M11 3C11 2.45 11.45 2 12 2H13C13.55 2 14 2.45 14 3V11C14 11.55 13.55 12 13 12H12C11.45 12 11 11.55 11 11V3Z"
                fill={iconColor}
              />
              <path
                d="M16 1C16 0.45 16.45 0 17 0H18C18.55 0 19 0.45 19 1V11C19 11.55 18.55 12 18 12H17C16.45 12 16 11.55 16 11V1Z"
                fill={iconColor}
                opacity="0.3"
              />
            </svg>
            {/* WiFi */}
            <svg width="34" height="24" viewBox="0 0 16 12" fill="none">
              <path
                d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11C9.5 11.83 8.83 12.5 8 12.5C7.17 12.5 6.5 11.83 6.5 11C6.5 10.17 7.17 9.5 8 9.5ZM8 5C10.7 5 13.1 6.1 14.8 7.9L13.4 9.3C12 7.9 10.1 7 8 7C5.9 7 4 7.9 2.6 9.3L1.2 7.9C2.9 6.1 5.3 5 8 5ZM8 0.5C12 0.5 15.5 2.1 18 4.6L16.6 6C14.4 3.8 11.4 2.5 8 2.5C4.6 2.5 1.6 3.8 -0.6 6L-2 4.6C0.5 2.1 4 0.5 8 0.5Z"
                fill={iconColor}
              />
            </svg>
            {/* Battery */}
            <svg width="50" height="24" viewBox="0 0 25 12" fill="none">
              <rect
                x="0.5"
                y="0.5"
                width="21"
                height="11"
                rx="2.5"
                stroke={iconColor}
                strokeOpacity="0.35"
              />
              <rect
                x="2"
                y="2"
                width="17"
                height="8"
                rx="1.5"
                fill={iconColor}
              />
              <path
                d="M23 4V8C23.83 7.67 24.33 6.83 24.33 6C24.33 5.17 23.83 4.33 23 4Z"
                fill={iconColor}
                fillOpacity="0.4"
              />
            </svg>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
