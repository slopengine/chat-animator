import React from 'react';

interface WhatsAppBackgroundProps {
  children: React.ReactNode;
}

// SVG pattern that mimics WhatsApp's doodle background
export const WhatsAppBackground: React.FC<WhatsAppBackgroundProps> = ({ children }) => {
  // WhatsApp doodle pattern as inline SVG
  const patternSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <pattern id="whatsapp-doodle" patternUnits="userSpaceOnUse" width="200" height="200">
          <rect width="200" height="200" fill="#efeae2"/>
          <!-- Phone icons -->
          <path d="M20,30 L25,30 L25,40 L20,40 Z" fill="#d4ccc4" opacity="0.6"/>
          <path d="M120,130 L125,130 L125,140 L120,140 Z" fill="#d4ccc4" opacity="0.6"/>
          <!-- Message bubbles -->
          <path d="M50,20 Q60,15 70,20 L70,30 Q60,35 50,30 Z" fill="#d4ccc4" opacity="0.5"/>
          <path d="M150,120 Q160,115 170,120 L170,130 Q160,135 150,130 Z" fill="#d4ccc4" opacity="0.5"/>
          <!-- Emoji faces -->
          <circle cx="100" cy="50" r="8" fill="none" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <circle cx="97" cy="48" r="1" fill="#d4ccc4" opacity="0.5"/>
          <circle cx="103" cy="48" r="1" fill="#d4ccc4" opacity="0.5"/>
          <path d="M96,52 Q100,55 104,52" fill="none" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <!-- Clock -->
          <circle cx="30" cy="100" r="10" fill="none" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <path d="M30,100 L30,94 M30,100 L35,100" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <!-- Camera -->
          <rect x="70" y="90" width="20" height="15" rx="2" fill="none" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <circle cx="80" cy="97" r="4" fill="none" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <!-- Heart -->
          <path d="M140,50 C135,45 130,50 140,60 C150,50 145,45 140,50" fill="#d4ccc4" opacity="0.4"/>
          <!-- Music note -->
          <path d="M170,80 L170,95 M170,80 L180,78 L180,93" stroke="#d4ccc4" stroke-width="1.5" fill="none" opacity="0.5"/>
          <circle cx="167" cy="95" r="3" fill="#d4ccc4" opacity="0.5"/>
          <circle cx="177" cy="93" r="3" fill="#d4ccc4" opacity="0.5"/>
          <!-- Star -->
          <path d="M50,150 L52,156 L58,156 L53,160 L55,166 L50,162 L45,166 L47,160 L42,156 L48,156 Z" fill="#d4ccc4" opacity="0.4"/>
          <!-- Thumbs up -->
          <path d="M100,150 L100,165 L105,165 L105,155 L110,150 Z" fill="#d4ccc4" opacity="0.4"/>
          <!-- Document -->
          <rect x="130" y="160" width="12" height="16" fill="none" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <path d="M133,165 L139,165 M133,169 L139,169 M133,173 L137,173" stroke="#d4ccc4" stroke-width="0.5" opacity="0.5"/>
          <!-- Microphone -->
          <rect x="170" y="150" width="8" height="12" rx="4" fill="none" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <path d="M166,162 Q174,168 182,162" fill="none" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
          <path d="M174,168 L174,175" stroke="#d4ccc4" stroke-width="1" opacity="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#whatsapp-doodle)"/>
    </svg>
  `;

  const encodedSvg = `data:image/svg+xml,${encodeURIComponent(patternSvg)}`;

  return (
    <div
      style={{
        flex: 1,
        backgroundImage: `url("${encodedSvg}")`,
        backgroundColor: '#efeae2',
        backgroundRepeat: 'repeat',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
};
