import { cn } from '@/lib/utils';

interface DoorProps {
  open: boolean;
  onEnter: () => void;
  disabled?: boolean;
}

const wallClass = 'h-full bg-gradient-to-b from-[hsl(0,0%,12%)] to-[hsl(0,0%,7%)]';

// A wall with a door set into the middle. Clicking the door swings it open (CSS 3D)
// while the side walls fade away, revealing the boardroom behind. Parent supplies `perspective`.
export function Door({ open, onEnter, disabled }: DoorProps) {
  return (
    <div className={cn('absolute inset-0 z-10 flex', open && 'pointer-events-none')}>
      {/* Left wall — inner shadow forms the door jamb */}
      <div
        className={cn(wallClass, 'flex-1 shadow-[inset_-14px_0_22px_rgba(0,0,0,0.65)]')}
        style={{ opacity: open ? 0 : 1, transition: 'opacity 900ms ease' }}
      />

      {/* The door leaf — warm wood, set into the wall */}
      <button
        type="button"
        onClick={onEnter}
        disabled={disabled || open}
        aria-label="Enter the Grill Room"
        className={cn(
          'group relative h-full w-[212px] shrink-0 origin-left focus:outline-none',
          open ? 'cursor-default' : 'cursor-pointer',
        )}
        style={{
          transform: open ? 'rotateY(-118deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          transition: 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
          // warm wood with bevelled edges (light catches top-left, shadow bottom-right)
          background: 'linear-gradient(160deg, hsl(24,18%,15%) 0%, hsl(22,20%,10%) 55%, hsl(20,22%,7%) 100%)',
          boxShadow:
            'inset 3px 3px 6px rgba(255,210,160,0.07), inset -4px -6px 12px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.9)',
          borderLeft: '1px solid rgba(255,210,160,0.06)',
          borderRight: '1px solid rgba(0,0,0,0.7)',
        }}
      >
        {/* Warm light leaking from the seams (the boardroom glows behind) */}
        <div
          className="absolute inset-y-2 -right-px w-1 pointer-events-none animate-orb-halo"
          style={{ background: 'linear-gradient(to left, hsla(32,80%,55%,0.55), transparent)', filter: 'blur(2px)' }}
        />
        <div
          className="absolute -bottom-px left-3 right-3 h-1 pointer-events-none animate-orb-halo"
          style={{ background: 'linear-gradient(to top, hsla(32,80%,55%,0.5), transparent)', filter: 'blur(2px)' }}
        />

        {/* Carved panels */}
        <div className="absolute inset-[14px] flex flex-col gap-[14px] pointer-events-none">
          {/* Upper panel — nameplate */}
          <div
            className="flex-1 rounded-[1px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(160deg, hsl(22,18%,12%), hsl(20,20%,8%))',
              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.7), inset -2px -2px 4px rgba(255,210,160,0.05)',
            }}
          >
            {/* Brass nameplate, engraved */}
            <div
              className="px-4 py-2 rounded-[1px] transition-all duration-300 group-hover:shadow-[0_0_22px_rgba(200,150,70,0.4)]"
              style={{
                background: 'linear-gradient(to bottom, hsl(42,48%,58%), hsl(40,38%,34%))',
                boxShadow: 'inset 1px 1px 2px rgba(255,240,200,0.6), inset -1px -1px 2px rgba(0,0,0,0.4)',
              }}
            >
              <p
                className="text-[9px] tracking-[0.22em] font-mono whitespace-nowrap font-bold"
                style={{ color: 'hsl(0,45%,18%)', textShadow: '0 1px 0 rgba(255,240,200,0.45)' }}
              >
                THE GRILL ROOM
              </p>
            </div>
          </div>
          {/* Lower panel */}
          <div
            className="flex-[1.6] rounded-[1px]"
            style={{
              background: 'linear-gradient(160deg, hsl(22,18%,12%), hsl(20,20%,8%))',
              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.7), inset -2px -2px 4px rgba(255,210,160,0.05)',
            }}
          />
        </div>

        {/* Brass handle — knob on a backplate, near the opening edge */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className="flex items-center justify-center w-3.5 h-16 rounded-full"
            style={{ background: 'linear-gradient(to right, hsl(40,30%,22%), hsl(40,25%,14%))', boxShadow: '0 0 8px rgba(0,0,0,0.6)' }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: 'radial-gradient(circle at 35% 30%, hsl(45,60%,72%), hsl(40,40%,34%) 70%)', boxShadow: '0 0 10px rgba(200,160,80,0.5)' }}
            />
          </div>
        </div>

        {/* Enter hint */}
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] font-mono text-muted-foreground/0 group-hover:text-muted-foreground/85 transition-colors duration-300 pointer-events-none">
          Step inside
        </span>
      </button>

      {/* Right wall — inner shadow forms the door jamb */}
      <div
        className={cn(wallClass, 'flex-1 shadow-[inset_14px_0_22px_rgba(0,0,0,0.65)]')}
        style={{ opacity: open ? 0 : 1, transition: 'opacity 900ms ease' }}
      />
    </div>
  );
}
