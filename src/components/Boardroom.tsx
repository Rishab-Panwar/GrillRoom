import type { AppState } from '../types';

// State-driven accent: cool when listening, amber while the panel deliberates, red when roasting.
const accent: Record<AppState, string> = {
  idle: 'hsl(0, 50%, 40%)',
  listening: 'hsl(0, 0%, 82%)',
  searching: 'hsl(38, 80%, 55%)',
  roasting: 'hsl(0, 75%, 52%)',
};

// One seated, backlit panel member. `speaker` raises a pointing arm while roasting.
function Member({
  x,
  scale = 1,
  state,
  delay = 0,
  speaker = false,
}: {
  x: number;
  scale?: number;
  state: AppState;
  delay?: number;
  speaker?: boolean;
}) {
  const discussing = state === 'searching';
  const roasting = state === 'roasting';
  const rim = accent[state];

  // While the panel deliberates, everyone leans toward the centre of the table.
  const CENTER = 280;
  const huddleDx = discussing ? (CENTER - x) * 0.32 : 0;

  return (
    <g transform={`translate(${x} 0)`}>
      <g style={{ transform: `translateX(${huddleDx}px) scale(${scale})`, transition: 'transform 0.8s ease' }}>
      <g
        className={discussing ? 'animate-discuss' : 'animate-breathe'}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animationDelay: `${delay}s` }}
      >
        {/* shoulders */}
        <path
          d="M-36 322 C-36 282 -18 264 0 264 C18 264 36 282 36 322 Z"
          fill="hsl(0,0%,3.5%)"
          stroke={speaker && roasting ? rim : 'transparent'}
          strokeOpacity={0.5}
          strokeWidth={1.5}
          style={{ transition: 'stroke 0.8s' }}
        />
        {/* head */}
        <ellipse
          cx="0"
          cy="250"
          rx="17"
          ry="19"
          fill="hsl(0,0%,3.5%)"
          stroke={speaker && roasting ? rim : 'transparent'}
          strokeOpacity={0.5}
          strokeWidth={1.5}
          style={{ transition: 'stroke 0.8s' }}
        />

        {/* Speaker's raised, pointing arm — appears while roasting */}
        {speaker && (
          <g
            className={roasting ? 'animate-jab' : ''}
            style={{ opacity: roasting ? 1 : 0, transition: 'opacity 0.5s' }}
          >
            <path d="M14 300 L30 264 L34 240" fill="none" stroke="hsl(0,0%,3.5%)" strokeWidth="11" strokeLinecap="round" />
            {/* finger / glow tip pointed at the user */}
            <circle cx="34" cy="236" r="4.5" fill={rim} style={{ transition: 'fill 0.8s' }} />
          </g>
        )}
      </g>
      </g>
    </g>
  );
}

export function Boardroom({ state }: { state: AppState }) {
  const color = accent[state];

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 560 420" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(32,70%,74%)" />
            <stop offset="42%" stopColor="hsl(22,62%,58%)" />
            <stop offset="78%" stopColor="hsl(14,45%,34%)" />
            <stop offset="100%" stopColor="hsl(10,35%,20%)" />
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(20,25%,16%)" />
            <stop offset="100%" stopColor="hsl(0,0%,4%)" />
          </linearGradient>
          <radialGradient id="spot" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="70%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky / sunset through the window */}
        <rect x="0" y="0" width="560" height="330" fill="url(#sky)" />

        {/* City skyline silhouette */}
        <g fill="hsl(220,18%,16%)">
          <rect x="20" y="232" width="46" height="98" />
          <rect x="74" y="252" width="34" height="78" />
          <rect x="116" y="214" width="40" height="116" />
          <rect x="402" y="220" width="44" height="110" />
          <rect x="452" y="246" width="36" height="84" />
          <rect x="496" y="228" width="46" height="102" />
          {/* central tower (Empire State-ish) */}
          <rect x="250" y="150" width="60" height="180" />
          <rect x="268" y="120" width="24" height="40" />
          <rect x="277" y="96" width="6" height="30" />
        </g>

        {/* Warm light beams spilling onto the floor */}
        <g fill="hsl(30,60%,55%)" opacity="0.10">
          <polygon points="150,330 230,330 120,420 0,420" />
          <polygon points="330,330 410,330 560,420 430,420" />
        </g>

        {/* Window frame: mullions + transom */}
        <g fill="hsl(0,0%,4%)">
          <rect x="0" y="0" width="560" height="10" />
          <rect x="0" y="64" width="560" height="9" />
          <rect x="134" y="0" width="10" height="330" />
          <rect x="275" y="0" width="10" height="330" />
          <rect x="416" y="0" width="10" height="330" />
        </g>

        {/* Floor */}
        <rect x="0" y="324" width="560" height="96" fill="url(#floor)" />

        {/* Far-side panel members (drawn before the table so it overlaps their torsos) */}
        <Member x={150} scale={1.0} state={state} delay={0} />
        <Member x={228} scale={1.06} state={state} delay={0.5} />
        <Member x={326} scale={1.08} state={state} delay={0.9} speaker />
        <Member x={410} scale={1.0} state={state} delay={1.3} />

        {/* A document sliding between members while they deliberate */}
        {state === 'searching' && (
          <rect x="262" y="342" width="34" height="22" rx="1" fill="hsl(40,30%,72%)" className="animate-slide-doc"
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        )}

        {/* Conference table (perspective top) over the members' laps */}
        <polygon points="104,378 456,378 372,330 188,330" fill="hsl(0,0%,6%)" stroke="hsl(0,0%,12%)" strokeWidth="1" />
        <polygon points="104,378 456,378 372,330 188,330" fill={color} fillOpacity="0.05" style={{ transition: 'fill 0.8s' }} />
        {/* front edge highlight */}
        <line x1="104" y1="378" x2="456" y2="378" stroke={color} strokeOpacity="0.18" strokeWidth="2" style={{ transition: 'stroke 0.8s' }} />

        {/* Foreground near-side chair backs (the viewer's seat side) */}
        <path d="M40 420 C40 372 70 350 104 350 C104 392 96 420 96 420 Z" fill="hsl(0,0%,2.5%)" />
        <path d="M520 420 C520 372 490 350 456 350 C456 392 464 420 464 420 Z" fill="hsl(0,0%,2.5%)" />
      </svg>

      {/* State-tinted overhead spotlight overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}22 0%, transparent 62%)` }}
      />
    </div>
  );
}
