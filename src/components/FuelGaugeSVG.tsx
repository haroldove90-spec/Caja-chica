import React from 'react';
import { NivelTanque } from '../types';

interface FuelGaugeProps {
  level: NivelTanque;
  size?: number; // width/height in px
  showLabel?: boolean;
}

export const FuelGaugeSVG: React.FC<FuelGaugeProps> = ({ level, size = 64, showLabel = false }) => {
  // Map level string to needle angle in degrees (E = -60deg, 1/4 = -30deg, 1/2 = 0deg, 3/4 = 30deg, F = 60deg)
  const angleMap: Record<NivelTanque, number> = {
    'E': -60,
    '1/4': -30,
    '1/2': 0,
    '3/4': 30,
    'F': 60
  };

  const angle = angleMap[level] ?? 0;

  return (
    <div className="inline-flex flex-col items-center justify-center">
      <svg
        width={size}
        height={Math.round(size * 0.75)}
        viewBox="0 0 100 75"
        className="overflow-visible select-none"
      >
        {/* Outer Gauge Arc */}
        <path
          d="M 15 55 A 40 40 0 0 1 85 55"
          fill="none"
          stroke="#3f3f46"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Ticks around arc */}
        {/* E Tick */}
        <line x1="20" y1="50" x2="26" y2="46" stroke="#dc2626" strokeWidth="2.5" />
        {/* 1/4 Tick */}
        <line x1="28" y1="32" x2="33" y2="30" stroke="#52525b" strokeWidth="1.5" />
        {/* 1/2 Tick */}
        <line x1="50" y1="15" x2="50" y2="21" stroke="#18181b" strokeWidth="2" />
        {/* 3/4 Tick */}
        <line x1="72" y1="32" x2="67" y2="30" stroke="#52525b" strokeWidth="1.5" />
        {/* F Tick */}
        <line x1="80" y1="50" x2="74" y2="46" stroke="#16a34a" strokeWidth="2.5" />

        {/* Labels: E, 1/2, F */}
        <text x="12" y="65" fontSize="8" fontWeight="bold" fill="#dc2626" textAnchor="middle">E</text>
        {/* Fuel pump symbol red dot near E */}
        <circle cx="21" cy="63" r="1.5" fill="#dc2626" />

        <text x="50" y="10" fontSize="8" fontWeight="bold" fill="#18181b" textAnchor="middle">½</text>
        <text x="88" y="65" fontSize="8" fontWeight="bold" fill="#16a34a" textAnchor="middle">F</text>

        {/* Pivot Center Dot */}
        <circle cx="50" cy="55" r="4" fill="#18181b" />

        {/* Needle Pointer */}
        <g transform={`rotate(${angle}, 50, 55)`}>
          <line
            x1="50"
            y1="55"
            x2="50"
            y2="22"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="55" r="2" fill="#ef4444" />
        </g>
      </svg>
      {showLabel && (
        <span className="text-[10px] font-bold text-zinc-800 mt-0.5">
          {level}
        </span>
      )}
    </div>
  );
};
