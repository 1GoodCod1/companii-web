/**
 * Digital "network / data" backdrop for the landing hero.
 *
 * Pure SVG (no photo) so it matches the site theme exactly: a faint dot grid +
 * a plexus of nodes and connections in the brand terracotta (--color-violet-*,
 * remapped to orange) and neutral slate. Light on white, concentrated to the
 * right so the headline stays clean.
 */
const NODES: Array<[number, number]> = [
  [560, 110], [660, 70], [700, 180], [620, 260], [780, 120], [860, 90],
  [820, 210], [920, 180], [1000, 110], [980, 230], [1080, 160], [1150, 250],
  [1100, 330], [900, 300], [780, 300], [700, 380], [840, 400], [960, 380],
  [1050, 440], [1140, 420], [980, 470],
];

const EDGES: Array<[number, number]> = [
  [0, 1], [0, 2], [1, 4], [2, 4], [2, 3], [2, 6], [4, 5], [4, 6], [5, 7],
  [6, 7], [7, 9], [7, 8], [8, 9], [8, 10], [9, 10], [10, 11], [9, 11],
  [9, 13], [6, 14], [3, 14], [13, 14], [13, 17], [14, 15], [15, 16],
  [16, 14], [16, 17], [17, 18], [18, 12], [12, 11], [18, 19], [19, 12],
  [16, 20], [20, 18], [20, 17], [11, 12],
];

// Nodes painted in the brand accent instead of neutral slate.
const ACCENT = new Set([4, 9, 16, 19]);

const ACCENT_COLOR = '#c2593f'; // --color-violet-600 (brand terracotta)
const NEUTRAL_COLOR = '#94a3b8'; // slate-400

export function HeroDigitalBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 560"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern id="faber-dotgrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#cbd5e1" />
          </pattern>
          <radialGradient id="faber-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.10" />
            <stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Faint data grid */}
        <rect width="1200" height="560" fill="url(#faber-dotgrid)" opacity="0.5" />
        {/* Soft brand glow under the cluster */}
        <ellipse cx="940" cy="220" rx="430" ry="330" fill="url(#faber-glow)" />

        {/* Connections */}
        <g stroke={NEUTRAL_COLOR} strokeWidth="1" opacity="0.3">
          {EDGES.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a][0]}
              y1={NODES[a][1]}
              x2={NODES[b][0]}
              y2={NODES[b][1]}
            />
          ))}
        </g>

        {/* Nodes */}
        {NODES.map(([x, y], i) =>
          ACCENT.has(i) ? (
            <circle key={i} cx={x} cy={y} r="3.4" fill={ACCENT_COLOR} opacity="0.85" />
          ) : (
            <circle key={i} cx={x} cy={y} r="2.4" fill={NEUTRAL_COLOR} opacity="0.5" />
          ),
        )}
      </svg>

      {/* Keep the headline column clean and fade into white at the bottom for the mock */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
    </div>
  );
}
