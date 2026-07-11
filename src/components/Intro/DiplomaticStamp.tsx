import { forwardRef } from 'react';

export const STAMP_SIZE = 440;
export const SLICE_COUNT = 22;
export const SLICE_HEIGHT = STAMP_SIZE / SLICE_COUNT;

/**
 * A face "física" do carimbo — SVG único, reaproveitado em cada fatia.
 * Usa mix-blend-mode: multiply para parecer tinta sobre papel (não flat).
 */
function StampFace() {
  return (
    <svg
      viewBox={`0 0 ${STAMP_SIZE} ${STAMP_SIZE}`}
      width={STAMP_SIZE}
      height={STAMP_SIZE}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        mixBlendMode: 'multiply',
      }}
    >
      <defs>
        <filter id="inkRough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
        </filter>
        <path id="arcTop" d="M 70,220 A 150,150 0 0 1 370,220" fill="none" />
        <path id="arcBottom" d="M 90,260 A 130,130 0 0 0 350,260" fill="none" />
      </defs>

      <g filter="url(#inkRough)" fill="none" stroke="#9c7a1f" strokeWidth="3" transform={`rotate(-5 ${STAMP_SIZE / 2} ${STAMP_SIZE / 2})`}>
        <circle cx={STAMP_SIZE / 2} cy={STAMP_SIZE / 2} r="205" strokeWidth="3" opacity="0.9" />
        <circle cx={STAMP_SIZE / 2} cy={STAMP_SIZE / 2} r="192" strokeWidth="1.5" opacity="0.6" />
        <circle cx={STAMP_SIZE / 2} cy={STAMP_SIZE / 2} r="150" strokeWidth="1" opacity="0.5" strokeDasharray="2 6" />

        <text fontFamily="IBM Plex Mono, monospace" fontSize="15" letterSpacing="5" fill="#9c7a1f" stroke="none">
          <textPath href="#arcTop" startOffset="50%" textAnchor="middle">
            REPÚBLICA DE DELETINDER
          </textPath>
        </text>
        <text fontFamily="IBM Plex Mono, monospace" fontSize="13" letterSpacing="4" fill="#9c7a1f" stroke="none">
          <textPath href="#arcBottom" startOffset="50%" textAnchor="middle">
            ★ PROTOCOLO Nº 001 / 2026 ★
          </textPath>
        </text>

        <text
          x={STAMP_SIZE / 2}
          y={STAMP_SIZE / 2 + 14}
          textAnchor="middle"
          fontFamily="Playfair Display, Georgia, serif"
          fontStyle="italic"
          fontWeight="700"
          fontSize="40"
          fill="#9c7a1f"
          stroke="#9c7a1f"
          strokeWidth="0.6"
        >
          DIPLOMATIZANDO
        </text>

        <line x1="145" y1={STAMP_SIZE / 2 + 30} x2="295" y2={STAMP_SIZE / 2 + 30} strokeWidth="1.5" opacity="0.7" />
      </g>
    </svg>
  );
}

type Props = {
  registerSlice: (el: HTMLDivElement | null, index: number) => void;
};

const DiplomaticStamp = forwardRef<HTMLDivElement, Props>(({ registerSlice }, containerRef) => {
  const slices = Array.from({ length: SLICE_COUNT });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: STAMP_SIZE,
        height: STAMP_SIZE,
        transformStyle: 'preserve-3d',
      }}
    >
      {slices.map((_, i) => (
        <div
          key={i}
          ref={(el) => registerSlice(el, i)}
          style={{
            position: 'absolute',
            top: i * SLICE_HEIGHT,
            left: 0,
            width: STAMP_SIZE,
            height: SLICE_HEIGHT,
            overflow: 'hidden',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={{ position: 'absolute', top: -i * SLICE_HEIGHT, left: 0 }}>
            <StampFace />
          </div>
        </div>
      ))}
    </div>
  );
});

DiplomaticStamp.displayName = 'DiplomaticStamp';
export default DiplomaticStamp;