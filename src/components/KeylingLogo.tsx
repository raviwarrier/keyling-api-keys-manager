import React from "react";

interface KeylingLogoProps {
  className?: string;
  size?: number;
}

export const KeylingLogo: React.FC<KeylingLogoProps> = ({ className = "w-6 h-6", size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="Keyling Logo (*_*_*_*)"
    >
      {/* 4 Asterisks with underscore baselines beneath or connecting */}
      {/* Background container styling can be handled by parent or transparent */}
      
      {/* Asterisk 1 at x=7, y=18 */}
      <g transform="translate(6.5, 17)">
        <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="-4.33" y1="-2.5" x2="4.33" y2="2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="-4.33" y1="2.5" x2="4.33" y2="-2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1.2" fill="currentColor" />
      </g>
      {/* Underscore 1 */}
      <line x1="3" y1="28" x2="10" y2="28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />

      {/* Asterisk 2 at x=18, y=18 */}
      <g transform="translate(18, 17)">
        <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="-4.33" y1="-2.5" x2="4.33" y2="2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="-4.33" y1="2.5" x2="4.33" y2="-2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1.2" fill="currentColor" />
      </g>
      {/* Underscore 2 */}
      <line x1="14.5" y1="28" x2="21.5" y2="28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />

      {/* Asterisk 3 at x=29.5, y=18 */}
      <g transform="translate(29.5, 17)">
        <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="-4.33" y1="-2.5" x2="4.33" y2="2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="-4.33" y1="2.5" x2="4.33" y2="-2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1.2" fill="currentColor" />
      </g>
      {/* Underscore 3 */}
      <line x1="26" y1="28" x2="33" y2="28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />

      {/* Asterisk 4 at x=41, y=18 */}
      <g transform="translate(41, 17)">
        <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="-4.33" y1="-2.5" x2="4.33" y2="2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="-4.33" y1="2.5" x2="4.33" y2="-2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1.2" fill="currentColor" />
      </g>
      {/* Underscore 4 */}
      <line x1="37.5" y1="28" x2="44.5" y2="28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};
