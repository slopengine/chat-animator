import React from 'react';

interface StatusBarProps {
  time?: string;
}

/**
 * iOS-style status bar matching Figma design exactly.
 * Uses outline-style icons like the real iOS.
 */
export const StatusBar: React.FC<StatusBarProps> = ({ time = '9:41' }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px 8px 28px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Time */}
      <div
        style={{
          fontSize: 34,
          fontWeight: 600,
          color: '#000000',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          letterSpacing: -0.5,
        }}
      >
        {time}
      </div>

      {/* Right side icons - outline style like Figma */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Signal bars - outline style */}
        <svg width="34" height="24" viewBox="0 0 17 11" fill="none">
          <rect x="0.5" y="7.5" width="2" height="3" rx="0.5" fill="#000"/>
          <rect x="4.5" y="5.5" width="2" height="5" rx="0.5" fill="#000"/>
          <rect x="8.5" y="3.5" width="2" height="7" rx="0.5" fill="#000"/>
          <rect x="12.5" y="0.5" width="2" height="10" rx="0.5" fill="#000"/>
        </svg>

        {/* WiFi - outline style */}
        <svg width="32" height="24" viewBox="0 0 16 12" fill="none">
          <path d="M8.00002 2.16669C10.1984 2.16669 12.2184 3.04169 13.7184 4.46669L15.0834 3.10002C13.1984 1.29169 10.7167 0.166687 8.00002 0.166687C5.28335 0.166687 2.80169 1.29169 0.916687 3.10002L2.28169 4.46669C3.78169 3.04169 5.80169 2.16669 8.00002 2.16669Z" fill="#000"/>
          <path d="M4.21669 6.40002C5.25002 5.44169 6.56169 4.86669 8.00002 4.86669C9.43835 4.86669 10.75 5.44169 11.7834 6.40002L13.1484 5.03335C11.7317 3.70002 9.95835 2.86669 8.00002 2.86669C6.04169 2.86669 4.26835 3.70002 2.85169 5.03335L4.21669 6.40002Z" fill="#000"/>
          <path d="M6.15002 8.33335C6.71669 7.83335 7.32502 7.56669 8.00002 7.56669C8.67502 7.56669 9.28335 7.83335 9.85002 8.33335L11.2167 6.96669C10.2834 6.09169 9.20002 5.56669 8.00002 5.56669C6.80002 5.56669 5.71669 6.09169 4.78335 6.96669L6.15002 8.33335Z" fill="#000"/>
          <circle cx="8" cy="10" r="1.5" fill="#000"/>
        </svg>

        {/* Battery - outline style with fill */}
        <svg width="50" height="24" viewBox="0 0 25 12" fill="none">
          <rect x="0.833" y="0.833" width="20.333" height="10.333" rx="2.167" stroke="#000" strokeWidth="1.5"/>
          <rect x="2.5" y="2.5" width="17" height="7" rx="1" fill="#000"/>
          <path d="M23 4V8C24.5 7.5 24.5 4.5 23 4Z" fill="#000"/>
        </svg>
      </div>
    </div>
  );
};
