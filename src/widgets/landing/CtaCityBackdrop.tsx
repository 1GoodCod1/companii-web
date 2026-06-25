/**
 * 2D city-skyline backdrop for the dark CTA section.
 *
 * Pure SVG line-art (no photo, no text): building outlines with a faint window
 * grid in white, plus a few "lit" windows in the brand terracotta. Anchored to
 * the bottom so the copy and the white card stay clean above it.
 */
const BOTTOM = 360;

// [x, width, topY]
const BUILDINGS: Array<[number, number, number]> = [
  [-20, 140, 170], [130, 90, 90], [230, 120, 210], [360, 80, 130],
  [450, 150, 55], [610, 100, 175], [720, 95, 115], [825, 140, 45],
  [975, 90, 165], [1075, 120, 100], [1205, 95, 210], [1310, 140, 70],
  [1460, 90, 140],
];

// Brand-orange "lit" windows scattered across the taller towers.
const LIT_WINDOWS: Array<[number, number]> = [
  [470, 90], [492, 90], [514, 140], [470, 170], [536, 120],
  [845, 80], [889, 80], [867, 130], [911, 165], [845, 205],
  [1330, 110], [1374, 110], [1352, 160], [1396, 205],
];

const ACCENT_COLOR = '#c2593f'; // --color-violet-600 (brand terracotta)

export function CtaCityBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[80%] select-none">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 1440 ${BOTTOM}`}
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <defs>
          <pattern id="cta-windows" width="22" height="26" patternUnits="userSpaceOnUse">
            <path d="M0 0 H22 M0 0 V26" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
          </pattern>
          <radialGradient id="cta-glow" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.08" />
            <stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Warm glow rising from the skyline */}
        <rect x="0" y="120" width="1440" height="240" fill="url(#cta-glow)" />

        {/* Buildings: window grid fill + crisp outline */}
        {BUILDINGS.map(([x, w, top]) => (
          <g key={`${x}-${top}`}>
            <rect x={x} y={top} width={w} height={BOTTOM - top} fill="url(#cta-windows)" />
            <rect
              x={x}
              y={top}
              width={w}
              height={BOTTOM - top}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.12"
              strokeWidth="1.2"
            />
          </g>
        ))}

        {/* Lit windows in brand colour */}
        {LIT_WINDOWS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="10" height="12" fill={ACCENT_COLOR} opacity="0.55" />
        ))}
      </svg>
    </div>
  );
}
