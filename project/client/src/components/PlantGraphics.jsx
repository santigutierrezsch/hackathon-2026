import React from 'react';

// Brought back the glowing graphics, but locked the size to 60px!
export const PLANT_ART = {
  '🌱': (
    <svg viewBox="0 0 100 100" width="60px" height="60px" style={{ filter: 'drop-shadow(0px 5px 3px rgba(105, 240, 174, 0.5))' }}>
      <defs>
        <linearGradient id="sproutGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#69F0AE" />
        </linearGradient>
      </defs>
      <path d="M50 90 Q40 60 15 40 Q45 45 48 65 Q60 30 85 25 Q65 50 52 70 L50 90" fill="url(#sproutGrad)" />
      <circle cx="50" cy="15" r="5" fill="#69F0AE" opacity="0.6" />
    </svg>
  ),
  '🌻': (
    <svg viewBox="0 0 100 100" width="60px" height="60px" style={{ filter: 'drop-shadow(0px 5px 3px rgba(255, 213, 79, 0.5))' }}>
      <path d="M48 90 L48 50 L52 50 L52 90 Z" fill="#81C784" />
      <circle cx="50" cy="35" r="25" fill="#FFC107" />
      <circle cx="50" cy="35" r="18" fill="#FF9800" />
      <circle cx="50" cy="35" r="10" fill="#795548" />
    </svg>
  ),
  '🍄': (
    <svg viewBox="0 0 100 100" width="60px" height="60px" style={{ filter: 'drop-shadow(0px 5px 5px rgba(224, 64, 251, 0.6))' }}>
      <defs>
        <linearGradient id="shroomGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E040FB" />
          <stop offset="100%" stopColor="#7B1FA2" />
        </linearGradient>
      </defs>
      <path d="M40 90 Q40 60 45 50 L55 50 Q60 60 60 90 Z" fill="#B2EBF2" />
      <path d="M10 55 C 10 10, 90 10, 90 55 Q 50 65 10 55 Z" fill="url(#shroomGrad)" />
      <circle cx="30" cy="35" r="6" fill="#18FFFF" />
      <circle cx="70" cy="40" r="4" fill="#18FFFF" />
      <circle cx="50" cy="20" r="7" fill="#18FFFF" />
    </svg>
  ),
  '🌵': (
    <svg viewBox="0 0 100 100" width="60px" height="60px" style={{ filter: 'drop-shadow(0px 5px 3px rgba(0, 0, 0, 0.4))' }}>
       <path d="M35 90 L35 30 A 15 15 0 0 1 65 30 L65 90 Z" fill="#4CAF50" />
       <path d="M20 60 L20 45 A 10 10 0 0 1 40 45 L40 55" fill="none" stroke="#4CAF50" strokeWidth="12" strokeLinecap="round" />
       <path d="M80 50 L80 35 A 10 10 0 0 0 60 35 L60 45" fill="none" stroke="#4CAF50" strokeWidth="12" strokeLinecap="round" />
       <circle cx="50" cy="15" r="8" fill="#FF5252" />
    </svg>
  ),
  '🌲': (
    <svg viewBox="0 0 100 100" width="60px" height="60px" style={{ filter: 'drop-shadow(0px 5px 4px rgba(0, 0, 0, 0.4))' }}>
       <rect x="45" y="70" width="10" height="25" fill="#5D4037" />
       <polygon points="50,10 80,45 20,45" fill="#2E7D32" />
       <polygon points="50,30 85,65 15,65" fill="#388E3C" />
       <polygon points="50,50 90,85 10,85" fill="#43A047" />
    </svg>
  ),
  '🌸': (
    <svg viewBox="0 0 100 100" width="60px" height="60px" style={{ filter: 'drop-shadow(0px 5px 6px rgba(255, 128, 171, 0.6))' }}>
       <path d="M45 90 Q40 50 20 40" fill="none" stroke="#4E342E" strokeWidth="6" strokeLinecap="round" />
       <path d="M55 90 Q60 50 80 40" fill="none" stroke="#4E342E" strokeWidth="6" strokeLinecap="round" />
       <path d="M50 90 L50 30" fill="none" stroke="#4E342E" strokeWidth="8" strokeLinecap="round" />
       <circle cx="50" cy="25" r="15" fill="#FF80AB" opacity="0.8" />
       <circle cx="25" cy="40" r="12" fill="#FF4081" opacity="0.8" />
       <circle cx="75" cy="35" r="14" fill="#F50057" opacity="0.8" />
       <circle cx="40" cy="45" r="10" fill="#FF80AB" opacity="0.9" />
       <circle cx="60" cy="50" r="10" fill="#FF4081" opacity="0.9" />
    </svg>
  )
};