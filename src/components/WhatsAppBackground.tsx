import React from 'react';
import { Img, staticFile } from 'remotion';

interface WhatsAppBackgroundProps {
  children: React.ReactNode;
}

/**
 * WhatsApp chat background with authentic light-theme doodle wallpaper.
 * Uses the actual WhatsApp wallpaper image for pixel-perfect accuracy.
 */
export const WhatsAppBackground: React.FC<WhatsAppBackgroundProps> = ({ children }) => {
  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Wallpaper background layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#F5F1EB',
        }}
      >
        <Img
          src={staticFile('assets/whatsapp-wallpaper-light.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
          }}
        />
      </div>
      
      {/* Content layer */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};
