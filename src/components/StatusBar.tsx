import React from 'react';

interface StatusBarProps {
  time?: string;
}

/**
 * iOS-style status bar with time, signal, wifi, and battery.
 * All indicators shown at full/max like in the Figma design.
 */
export const StatusBar: React.FC<StatusBarProps> = ({ time = '9:41' }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px 10px 24px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Time */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#000000',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          letterSpacing: -0.5,
        }}
      >
        {time}
      </div>

      {/* Right side icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Signal bars - full strength */}
        <svg width="36" height="24" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#000"/>
          <rect x="4" y="5" width="3" height="7" rx="0.5" fill="#000"/>
          <rect x="8" y="2" width="3" height="10" rx="0.5" fill="#000"/>
          <rect x="12" y="0" width="3" height="12" rx="0.5" fill="#000"/>
        </svg>

        {/* WiFi - full strength */}
        <svg width="32" height="24" viewBox="0 0 16 12" fill="none">
          <path d="M8 2.4C5.6 2.4 3.4 3.3 1.7 4.8L0 3C2.1 1.1 4.9 0 8 0C11.1 0 13.9 1.1 16 3L14.3 4.8C12.6 3.3 10.4 2.4 8 2.4Z" fill="#000"/>
          <path d="M8 5.6C6.4 5.6 4.9 6.2 3.7 7.2L2 5.4C3.6 4.1 5.7 3.2 8 3.2C10.3 3.2 12.4 4.1 14 5.4L12.3 7.2C11.1 6.2 9.6 5.6 8 5.6Z" fill="#000"/>
          <path d="M8 8.8C7.1 8.8 6.3 9.1 5.7 9.6L4 7.8C5.1 6.9 6.5 6.4 8 6.4C9.5 6.4 10.9 6.9 12 7.8L10.3 9.6C9.7 9.1 8.9 8.8 8 8.8Z" fill="#000"/>
          <circle cx="8" cy="11" r="1.5" fill="#000"/>
        </svg>

        {/* Battery - full */}
        <svg width="50" height="24" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#000" strokeWidth="1"/>
          <rect x="2" y="2" width="18" height="8" rx="1" fill="#000"/>
          <path d="M23 4V8C24.1 8 24.1 4 23 4Z" fill="#000"/>
        </svg>
      </div>
    </div>
  );
};
