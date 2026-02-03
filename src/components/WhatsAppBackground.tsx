import React from 'react';

interface WhatsAppBackgroundProps {
  children: React.ReactNode;
}

/**
 * WhatsApp chat background.
 * Uses the exact background color from Figma design.
 * 
 * TODO: Add subtle doodle pattern overlay once light-theme wallpaper is exported
 */
export const WhatsAppBackground: React.FC<WhatsAppBackgroundProps> = ({ children }) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        // Exact background color from Figma: Color/Product Systems/Chat Background Wallpaper
        backgroundColor: '#F5F1EB',
      }}
    >
      {children}
    </div>
  );
};
