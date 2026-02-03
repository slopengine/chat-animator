import React from 'react';

interface WhatsAppBackgroundProps {
  children: React.ReactNode;
}

/**
 * WhatsApp chat background with authentic light-theme doodle pattern.
 * Uses SVG pattern matching the real WhatsApp wallpaper style.
 * Colors from Figma: Background #F5F1EB, Doodles #EAE0D3
 */
export const WhatsAppBackground: React.FC<WhatsAppBackgroundProps> = ({ children }) => {
  // SVG doodle pattern matching WhatsApp's light theme style
  const doodlePattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#F5F1EB"/>
      <g fill="none" stroke="#E5DDD5" stroke-width="1.2" opacity="0.7">
        <!-- Row 1 -->
        <circle cx="30" cy="30" r="12"/>
        <path d="M28,26 Q30,22 32,26 Q34,30 32,34 Q30,38 28,34 Q26,30 28,26"/>
        <rect x="70" y="20" width="20" height="20" rx="3"/>
        <path d="M120,25 l10,15 l10,-15"/>
        <circle cx="170" cy="30" r="8"/>
        <circle cx="167" cy="28" r="2"/>
        <circle cx="173" cy="28" r="2"/>
        <path d="M165,33 Q170,37 175,33"/>
        <rect x="210" y="22" width="16" height="16" rx="8"/>
        <path d="M260,20 v20 M250,30 h20"/>
        <path d="M300,25 l15,10 l-15,10"/>
        <circle cx="360" cy="30" r="10"/>
        <path d="M355,30 h10 M360,25 v10"/>
        
        <!-- Row 2 -->
        <path d="M25,80 Q35,65 45,80 Q55,95 45,95 Q35,95 25,80"/>
        <rect x="75" y="70" width="18" height="22" rx="2"/>
        <circle cx="84" cy="78" r="5"/>
        <path d="M130,75 l8,20 l8,-20"/>
        <circle cx="175" cy="85" r="12"/>
        <path d="M168,82 h14 M168,88 h10"/>
        <rect x="220" y="72" width="22" height="18" rx="4"/>
        <circle cx="231" cy="81" r="4"/>
        <path d="M270,70 c10,5 10,25 0,30"/>
        <path d="M280,70 c-10,5 -10,25 0,30"/>
        <circle cx="330" cy="85" r="10"/>
        <path d="M325,85 l5,-8 l5,8"/>
        <rect x="365" y="75" width="20" height="15" rx="3"/>
        
        <!-- Row 3 -->
        <path d="M20,130 h25 M32,120 v25"/>
        <circle cx="85" cy="135" r="15"/>
        <path d="M78,132 l7,10 l7,-10"/>
        <rect x="120" y="125" width="25" height="20" rx="5"/>
        <path d="M175,125 l10,25 l10,-25"/>
        <circle cx="230" cy="140" r="12"/>
        <circle cx="225" cy="137" r="3"/>
        <circle cx="235" cy="137" r="3"/>
        <path d="M225,145 Q230,150 235,145"/>
        <path d="M275,130 c20,0 20,20 0,20 c-20,0 -20,-20 0,-20"/>
        <rect x="320" y="128" width="18" height="24" rx="9"/>
        <path d="M370,130 Q380,140 370,150 Q360,140 370,130"/>
        
        <!-- Row 4 -->
        <circle cx="35" cy="195" r="18"/>
        <path d="M28,192 h14"/>
        <path d="M28,198 h10"/>
        <rect x="80" y="182" width="22" height="26" rx="4"/>
        <circle cx="91" cy="190" r="6"/>
        <path d="M130,185 l12,20 l12,-20 l-6,0 l-6,12 l-6,-12 z"/>
        <circle cx="185" cy="195" r="12"/>
        <path d="M182,188 v14 M178,195 h14"/>
        <path d="M230,180 v30 M220,185 h20"/>
        <rect x="270" y="183" width="24" height="24" rx="12"/>
        <circle cx="282" cy="195" r="6"/>
        <path d="M330,185 l15,10 l-15,10 z"/>
        <circle cx="375" cy="195" r="10"/>
        
        <!-- Row 5 -->
        <path d="M25,250 Q40,235 55,250 Q40,265 25,250"/>
        <rect x="85" y="240" width="20" height="20" rx="2"/>
        <path d="M88,243 v14 M92,243 v14 M96,243 v14 M100,243 v14"/>
        <circle cx="145" cy="250" r="15"/>
        <path d="M137,250 h16 M145,242 v16"/>
        <path d="M190,240 l10,10 l10,-10 l-10,10 l-10,-10"/>
        <circle cx="250" cy="250" r="12"/>
        <circle cx="246" cy="247" r="2"/>
        <circle cx="254" cy="247" r="2"/>
        <path d="M250,255 l-3,-3 h6 l-3,3"/>
        <rect x="295" y="240" width="20" height="20" rx="10"/>
        <path d="M350,242 l10,18 l10,-18"/>
        
        <!-- Row 6 -->
        <circle cx="40" cy="310" r="14"/>
        <path d="M35,305 l5,10 l5,-10"/>
        <rect x="85" y="298" width="24" height="24" rx="3"/>
        <path d="M90,310 h14"/>
        <path d="M97,303 v14"/>
        <path d="M140,300 c15,5 15,20 0,25 c-15,-5 -15,-20 0,-25"/>
        <circle cx="200" cy="310" r="10"/>
        <path d="M195,310 h10 M200,305 v10"/>
        <rect x="245" y="302" width="18" height="16" rx="4"/>
        <circle cx="254" cy="308" r="3"/>
        <path d="M300,300 v20 h20 v-20 z M305,305 h10 M305,310 h10 M305,315 h7"/>
        <circle cx="365" cy="310" r="12"/>
        
        <!-- Row 7 -->
        <path d="M30,365 l15,15 l15,-15 l-15,15 l-15,-15"/>
        <circle cx="95" cy="370" r="12"/>
        <path d="M90,365 q5,10 10,0"/>
        <rect x="135" y="360" width="22" height="22" rx="11"/>
        <path d="M190,360 l10,20 l10,-20 z"/>
        <circle cx="250" cy="370" r="10"/>
        <circle cx="247" cy="368" r="2"/>
        <circle cx="253" cy="368" r="2"/>
        <path d="M247,374 q3,3 6,0"/>
        <path d="M300,362 v16 M292,370 h16"/>
        <rect x="345" y="358" width="26" height="24" rx="5"/>
        <circle cx="358" cy="367" r="5"/>
      </g>
    </svg>
  `;

  const encodedSvg = `data:image/svg+xml,${encodeURIComponent(doodlePattern)}`;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#F5F1EB',
        backgroundImage: `url("${encodedSvg}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px', // Scale down the pattern
      }}
    >
      {children}
    </div>
  );
};
