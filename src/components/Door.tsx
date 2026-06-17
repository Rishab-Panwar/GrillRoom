import { cn } from '@/lib/utils';

interface DoorProps {
  open: boolean;
  onEnter: () => void;
  disabled?: boolean;
}

const wallClass = 'h-full bg-gradient-to-b from-[hsl(0,0%,11%)] to-[hsl(0,0%,6%)]';

// A wall with a door set into the middle. Clicking the door swings it open (CSS 3D)
// while the side walls fade away, revealing the full boardroom behind. The parent
// provides the `perspective`.
export function Door({ open, onEnter, disabled }: DoorProps) {
  return (
    <div className={cn('absolute inset-0 z-10 flex', open && 'pointer-events-none')}>
      {/* Left wall */}
      <div
        className={cn(wallClass, 'flex-1 border-r border-black/50')}
        style={{ opacity: open ? 0 : 1, transition: 'opacity 900ms ease' }}
      />

      {/* The door itself */}
      <button
        type="button"
        onClick={onEnter}
        disabled={disabled || open}
        aria-label="Enter the Grill Room"
        className={cn(
          'group relative h-full w-[210px] shrink-0 origin-left focus:outline-none',
          'border-2 border-[hsl(0,0%,14%)]',
          'bg-gradient-to-b from-[hsl(0,0%,12%)] to-[hsl(0,0%,7%)]',
          'shadow-[inset_0_0_70px_rgba(0,0,0,0.65)]',
          open ? 'cursor-default' : 'cursor-pointer',
        )}
        style={{
          transform: open ? 'rotateY(-118deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          transition: 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Recessed panels */}
        <div className="absolute inset-4 flex flex-col gap-4 pointer-events-none">
          <div className="flex-1 border border-[hsl(0,0%,15%)] shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] flex items-center justify-center">
            <div className="px-3 py-2 border border-kill-red/30 bg-black/50 transition-all duration-300 group-hover:border-kill-red/60 group-hover:shadow-[0_0_24px_rgba(180,30,30,0.25)]">
              <p className="text-[9px] tracking-[0.18em] text-kill-red/70 font-mono whitespace-nowrap group-hover:text-kill-red/90">
                THE GRILL ROOM
              </p>
            </div>
          </div>
          <div className="flex-[1.5] border border-[hsl(0,0%,15%)] shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />
        </div>

        {/* Handle */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-14 rounded-full pointer-events-none bg-gradient-to-b from-[hsl(40,35%,58%)] to-[hsl(40,22%,30%)] shadow-[0_0_14px_rgba(200,160,80,0.4)]" />

        {/* Enter hint */}
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] font-mono text-muted-foreground/0 group-hover:text-muted-foreground/80 transition-colors duration-300 pointer-events-none">
          Step inside
        </span>
      </button>

      {/* Right wall */}
      <div
        className={cn(wallClass, 'flex-1 border-l border-black/50')}
        style={{ opacity: open ? 0 : 1, transition: 'opacity 900ms ease' }}
      />
    </div>
  );
}
