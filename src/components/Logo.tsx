import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg viewBox="0 0 500 500" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="bottomCurve" d="M 75,250 A 175,175 0 0,0 425,250" fill="transparent" />
      </defs>
      {/* Outer rings */}
      <circle cx="250" cy="250" r="230" fill="white" stroke="#1E293B" strokeWidth="12" />
      <circle cx="250" cy="250" r="210" fill="none" stroke="#DCA543" strokeWidth="6" />
      
      {/* Bottom dark section */}
      <path d="M 40 250 A 210 210 0 0 0 460 250 Z" fill="#1E293B" />
      
      {/* Curved text */}
      <text fill="#ffffff" fontSize="22" fontWeight="bold" letterSpacing="4">
        <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
          • YOUR SERVICEHUB PARTNER •
        </textPath>
      </text>

      {/* Person */}
      <g transform="translate(0, -15)">
        {/* Shoulders / Shirt */}
        <path d="M 130 280 C 130 180, 370 180, 370 280 Z" fill="#1E293B" />
        
        {/* Apron */}
        <path d="M 180 280 L 180 220 L 320 220 L 320 280 Z" fill="#DCA543" />
        <circle cx="200" cy="235" r="10" fill="#1E293B" />
        <circle cx="300" cy="235" r="10" fill="#1E293B" />
        {/* Apron straps */}
        <path d="M 180 220 L 155 185" stroke="#DCA543" strokeWidth="16" strokeLinecap="round" />
        <path d="M 320 220 L 345 185" stroke="#DCA543" strokeWidth="16" strokeLinecap="round" />
        
        {/* Neck */}
        <rect x="220" y="150" width="60" height="50" fill="#F4B898" />
        
        {/* Head */}
        <circle cx="250" cy="120" r="65" fill="#F4B898" />
        
        {/* Ears */}
        <circle cx="180" cy="120" r="15" fill="#F4B898" />
        <circle cx="320" cy="120" r="15" fill="#F4B898" />
        
        {/* Hat Brim */}
        <path d="M 175 95 C 175 60, 325 60, 325 95 Z" fill="#1E293B" />
        
        {/* Hat Dome */}
        <path d="M 190 85 C 190 10, 310 10, 310 85 Z" fill="#DCA543" />
        <circle cx="250" cy="20" r="10" fill="#DCA543" />
      </g>

      {/* Center Banner */}
      <g transform="translate(250, 275)">
        {/* Banner background */}
        <path d="M -230 -50 C -240 -50, -250 40, -230 40 L 230 40 C 250 40, 240 -50, 230 -50 Z" fill="#1E293B" />
        <path d="M -230 -50 C -240 -50, -250 40, -230 40 L 230 40 C 250 40, 240 -50, 230 -50 Z" fill="none" stroke="#DCA543" strokeWidth="6" />
        
        {/* Text */}
        <text x="0" y="15" fontFamily="sans-serif" fontSize="70" fontWeight="900" fontStyle="italic" fill="#ffffff" textAnchor="middle" letterSpacing="-2">
          ServiceHub
        </text>
        
        {/* Divider lines between icons */}
        <line x1="-135" y1="45" x2="-135" y2="75" stroke="#DCA543" strokeWidth="2" />
        <line x1="-65" y1="45" x2="-65" y2="75" stroke="#DCA543" strokeWidth="2" />
        <line x1="5" y1="45" x2="5" y2="75" stroke="#DCA543" strokeWidth="2" />
        <line x1="75" y1="45" x2="75" y2="75" stroke="#DCA543" strokeWidth="2" />
        
        {/* Small Icons */}
        {/* House */}
        <g transform="translate(-170, 60) scale(1.3)">
          <path d="M -10 -2 L 0 -12 L 10 -2 L 10 10 L -10 10 Z" fill="#DCA543" stroke="#DCA543" strokeWidth="2" strokeLinejoin="round" />
          <rect x="-3" y="2" width="6" height="8" fill="#1E293B" />
        </g>
        
        {/* Wrench */}
        <g transform="translate(-100, 60) rotate(45) scale(1.1)">
          <path d="M -8 -10 C -8 -18, 8 -18, 8 -10 L 4 -4 L 4 15 C 4 18, -4 18, -4 15 L -4 -4 Z" fill="#DCA543" />
          <circle cx="0" cy="-10" r="3" fill="#1E293B" />
        </g>
        
        {/* Hammer */}
        <g transform="translate(-30, 60) rotate(-45) scale(1.1)">
          <path d="M -12 -12 L 8 -12 C 10 -12, 10 -4, 8 -4 L -12 -4 Z" fill="#DCA543" />
          <rect x="-4" y="-4" width="6" height="20" fill="#DCA543" rx="2" />
        </g>
        
        {/* Tap */}
        <g transform="translate(40, 60) scale(1.2)">
          <path d="M -8 -10 L 8 -10 L 8 -4 L 4 -4 L 4 4 L -4 4 L -4 -4 L -8 -4 Z" fill="#DCA543" />
          <path d="M 0 8 C 3 12, 4 16, 0 20 C -4 16, -3 12, 0 8 Z" fill="#DCA543" />
        </g>
        
        {/* Plug */}
        <g transform="translate(110, 60) scale(1.2)">
          <rect x="-6" y="-12" width="3" height="8" fill="#DCA543" />
          <rect x="3" y="-12" width="3" height="8" fill="#DCA543" />
          <path d="M -8 -4 L 8 -4 L 8 4 C 8 8, 4 10, 0 10 C -4 10, -8 8, -8 4 Z" fill="#DCA543" />
          <rect x="-1.5" y="10" width="3" height="8" fill="#DCA543" />
        </g>
      </g>
    </svg>
  );
};
