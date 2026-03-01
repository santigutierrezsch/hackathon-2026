import React from "react";

const svgStyle = (shadow) => ({ filter: `drop-shadow(0px 5px 4px ${shadow})` });

export const PLANT_ART = {
  "🌱": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(105, 240, 174, 0.5)")}>
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
  "🌻": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(255, 213, 79, 0.5)")}>
      <path d="M48 90 L48 50 L52 50 L52 90 Z" fill="#81C784" />
      <circle cx="50" cy="35" r="25" fill="#FFC107" />
      <circle cx="50" cy="35" r="18" fill="#FF9800" />
      <circle cx="50" cy="35" r="10" fill="#795548" />
    </svg>
  ),
  "🍄": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(224, 64, 251, 0.5)")}>
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
  "🌵": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(0, 0, 0, 0.35)")}>
      <path d="M35 90 L35 30 A 15 15 0 0 1 65 30 L65 90 Z" fill="#4CAF50" />
      <path d="M20 60 L20 45 A 10 10 0 0 1 40 45 L40 55" fill="none" stroke="#4CAF50" strokeWidth="12" strokeLinecap="round" />
      <path d="M80 50 L80 35 A 10 10 0 0 0 60 35 L60 45" fill="none" stroke="#4CAF50" strokeWidth="12" strokeLinecap="round" />
      <circle cx="50" cy="15" r="8" fill="#FF5252" />
    </svg>
  ),
  "🌲": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(0, 0, 0, 0.35)")}>
      <rect x="45" y="70" width="10" height="25" fill="#5D4037" />
      <polygon points="50,10 80,45 20,45" fill="#2E7D32" />
      <polygon points="50,30 85,65 15,65" fill="#388E3C" />
      <polygon points="50,50 90,85 10,85" fill="#43A047" />
    </svg>
  ),
  "🌸": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(255, 128, 171, 0.55)")}>
      <path d="M45 90 Q40 50 20 40" fill="none" stroke="#4E342E" strokeWidth="6" strokeLinecap="round" />
      <path d="M55 90 Q60 50 80 40" fill="none" stroke="#4E342E" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 90 L50 30" fill="none" stroke="#4E342E" strokeWidth="8" strokeLinecap="round" />
      <circle cx="50" cy="25" r="15" fill="#FF80AB" opacity="0.8" />
      <circle cx="25" cy="40" r="12" fill="#FF4081" opacity="0.8" />
      <circle cx="75" cy="35" r="14" fill="#F50057" opacity="0.8" />
      <circle cx="40" cy="45" r="10" fill="#FF80AB" opacity="0.9" />
      <circle cx="60" cy="50" r="10" fill="#FF4081" opacity="0.9" />
    </svg>
  ),
  "🍀": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(40, 160, 80, 0.45)")}>
      <path d="M50 90 Q48 75 50 62" fill="none" stroke="#2e7d32" strokeWidth="5" />
      <circle cx="38" cy="46" r="12" fill="#4caf50" />
      <circle cx="62" cy="46" r="12" fill="#4caf50" />
      <circle cx="44" cy="60" r="12" fill="#43a047" />
      <circle cx="56" cy="60" r="12" fill="#43a047" />
    </svg>
  ),
  "🌴": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(50, 140, 90, 0.45)")}>
      <path d="M52 92 Q46 70 50 40" fill="none" stroke="#8d6e63" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 38 C25 28, 20 20, 12 10" fill="none" stroke="#2e7d32" strokeWidth="7" strokeLinecap="round" />
      <path d="M50 38 C75 28, 80 20, 88 10" fill="none" stroke="#2e7d32" strokeWidth="7" strokeLinecap="round" />
      <path d="M50 38 C30 45, 20 50, 12 56" fill="none" stroke="#388e3c" strokeWidth="7" strokeLinecap="round" />
      <path d="M50 38 C70 45, 80 50, 88 56" fill="none" stroke="#388e3c" strokeWidth="7" strokeLinecap="round" />
    </svg>
  ),
  "🍁": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(180, 90, 40, 0.45)")}>
      <path d="M50 92 L52 66" fill="none" stroke="#6d4c41" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 22 L58 38 L76 34 L66 50 L82 58 L62 60 L64 78 L50 66 L36 78 L38 60 L18 58 L34 50 L24 34 L42 38 Z" fill="#d2691e" />
    </svg>
  ),
  "🌿": (
    <svg viewBox="0 0 100 100" width="60" height="60" style={svgStyle("rgba(50, 150, 70, 0.45)")}>
      <path d="M50 92 L50 45" fill="none" stroke="#2e7d32" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="40" cy="58" rx="10" ry="16" transform="rotate(-25 40 58)" fill="#66bb6a" />
      <ellipse cx="60" cy="52" rx="10" ry="16" transform="rotate(25 60 52)" fill="#4caf50" />
      <ellipse cx="43" cy="40" rx="8" ry="12" transform="rotate(-30 43 40)" fill="#81c784" />
      <ellipse cx="58" cy="35" rx="8" ry="12" transform="rotate(20 58 35)" fill="#66bb6a" />
    </svg>
  ),
};
