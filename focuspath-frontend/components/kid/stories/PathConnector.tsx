'use client';

import React from 'react';

interface PathConnectorProps {
  direction?:
    | 'left-to-right'
    | 'right-to-left'
    | 'left-to-center'
    | 'right-to-center'
    | 'center-to-left'
    | 'center-to-right'
    | 'right-to-right'
    | 'left-to-left'
    | 'center';
  color?: string;
  waypointIcon?: string;
}

export default function PathConnector({
  direction = 'left-to-right',
  color = '#a78bfa',
  waypointIcon = '🌴',
}: PathConnectorProps) {
  const getPathD = () => {
    switch (direction) {
      case 'left-to-right':
        return 'M 80 0 C 80 50, 320 50, 320 100';
      case 'right-to-left':
        return 'M 320 0 C 320 50, 80 50, 80 100';
      case 'left-to-center':
        return 'M 80 0 C 80 50, 200 50, 200 100';
      case 'right-to-center':
        return 'M 320 0 C 320 50, 200 50, 200 100';
      case 'center-to-left':
        return 'M 200 0 C 200 50, 80 50, 80 100';
      case 'center-to-right':
        return 'M 200 0 C 200 50, 320 50, 320 100';
      case 'right-to-right':
        return 'M 320 0 L 320 100';
      case 'left-to-left':
        return 'M 80 0 L 80 100';
      case 'center':
      default:
        return 'M 200 0 L 200 100';
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-28 my-[-32px] pointer-events-none flex items-center justify-center z-0">
      {/* SVG Smooth S-Curve Dashed Path Line */}
      <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none" fill="none">
        <path
          d={getPathD()}
          stroke={color}
          strokeWidth="6"
          strokeDasharray="10 10"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>

      {/* Decorative Waypoint Icon along the path center */}
      {waypointIcon && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl opacity-80 animate-kid-float select-none drop-shadow-xs">
          {waypointIcon}
        </div>
      )}
    </div>
  );
}
