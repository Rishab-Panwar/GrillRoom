import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Door } from './components/Door';
import { Boardroom } from './components/Boardroom';
import { SourcesPanel } from './components/SourcesPanel';
import { useAppConversation } from './hooks/useAppConversation';
import type { Turn } from './types';

function downloadReport(turns: Turn[], companyName: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 0;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkY = (needed: number) => {
    if (y + needed > 277) addPage();
  };

  // --- Dark header band ---
  doc.setFillColor(8, 8, 8);
  doc.rect(0, 0, W, 28, 'F');

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('GRILLROOM · CASE FILE', margin, 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(220, 220, 220);
  doc.text((companyName || 'CASE FILE').toUpperCase(), margin, 21);

  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(date, W - margin, 21, { align: 'right' });

  y = 38;

  turns.forEach((turn, turnIndex) => {
    // Turn divider (except first)
    if (turnIndex > 0) {
      checkY(16);
      doc.setDrawColor(220, 50, 50);
      doc.setLineWidth(0.3);
      doc.line(margin, y, W - margin, y);
      y += 10;
    }

    // Idea title
    checkY(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    const ideaLines = doc.splitTextToSize(turn.idea, contentW);
    doc.text(ideaLines, margin, y);
    y += ideaLines.length * 6 + 6;

    // The verdict — what the panel actually said
    if (turn.verdict) {
      checkY(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(25, 25, 25);
      doc.text('THE VERDICT', margin, y);
      doc.setDrawColor(200, 60, 60);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2, margin + 26, y + 2);
      y += 9;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(45, 45, 45);
      const verdictLines = doc.splitTextToSize(turn.verdict, contentW);
      verdictLines.forEach((line: string) => {
        checkY(6);
        doc.text(line, margin, y);
        y += 5.4;
      });
      y += 8;
    }

    // Evidence label
    checkY(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(25, 25, 25);
    doc.text('THE EVIDENCE', margin, y);
    doc.setDrawColor(200, 60, 60);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, margin + 28, y + 2);
    y += 10;

    // Sources
    turn.sources.forEach((source) => {
      checkY(22);

      // Source card background
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(margin, y - 3, contentW, 22, 1, 1, 'F');

      // Domain
      let domain = source.url;
      try { domain = new URL(source.url).hostname.replace('www.', ''); } catch { /* ignore */ }
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(150, 50, 50);
      doc.text(domain.toUpperCase(), margin + 3, y + 3);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      const titleLines = doc.splitTextToSize(source.title, contentW - 6);
      doc.text(titleLines.slice(0, 2), margin + 3, y + 8);

      // Description
      if (source.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const descLines = doc.splitTextToSize(source.description, contentW - 6);
        doc.text(descLines.slice(0, 2), margin + 3, y + 15);
      }

      // Clickable link
      doc.link(margin, y - 3, contentW, 22, { url: source.url });

      y += 26;
    });

    y += 4;
  });

  // Footer
  checkY(12);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, y, W - margin, y);
  y += 6;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text('GRILL ROOM', margin, y);
  doc.text('grillroom.rishabai.me', W - margin, y, { align: 'right' });

  doc.save(`case-file-${Date.now()}.pdf`);
}

export default function App() {
  const { appState, connecting, turns, startSession, endSession, error } = useAppConversation();
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [entered, setEntered] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);

  const handleEnter = async () => {
    if (appState !== 'idle' || connecting) return;
    setPanelCollapsed(false);
    setEntered(true);
    const ok = await startSession();
    if (!ok) setEntered(false); // connection failed — swing the door shut again
  };

  const handleQuit = () => {
    setPanelCollapsed(true);
    endSession();
  };

  // Close the door whenever a session ends (manual quit or watchdog auto-end).
  useEffect(() => {
    if (appState === 'idle') setEntered(false);
  }, [appState]);

  const showDownload = appState === 'idle' && turns.length > 0;

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden transition-colors duration-1000"
      style={{
        backgroundColor: appState === "roasting" ? "hsl(0, 16%, 4.5%)" : "hsl(0, 12%, 4%)",
        boxShadow: "inset 0 0 240px 50px rgba(0,0,0,0.6)",
      }}
    >
      {/* Left panel — warm ember glow rises behind the door */}
      <div
        className="flex-1 flex flex-col relative min-w-0"
        style={{ background: 'radial-gradient(ellipse 55% 50% at 50% 52%, hsla(18,85%,32%,0.13), transparent 72%)' }}
      >
        {/* About button */}
        <button
          onClick={() => setShowHelp((v) => !v)}
          className="absolute top-6 left-6 z-20 h-8 px-3 flex items-center justify-center border border-muted-foreground/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground font-mono text-[10px] uppercase tracking-[0.25em] transition-colors duration-200"
          style={{ borderRadius: 0 }}
        >
          About
        </button>

        {/* About panel */}
        {showHelp && (
          <div className="absolute top-14 left-6 z-20 w-72 border border-border bg-[hsl(0,0%,4%)] p-5 animate-fade-in-up">
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">Convinced your idea is the one?</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">Step into the Grill Room and pitch it to a panel that isn't here to clap. As you talk, they dig up your real competitors, the clones that already died, and the funding that already happened — live.</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Far better to get torn apart in here than across a real boardroom table.</p>
            <div className="h-px bg-border mb-4" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono mb-4">The drill</p>
            <ul className="space-y-3">
              {[
                "Open the door and let the mic in.",
                "Say your idea out loud — the room is already listening.",
                "While you talk, it scours the live web for rivals, failures, and hard numbers.",
                "Whatever it finds lands in the panel on the right.",
                "Then comes the verdict — blunt, sourced, and rarely kind.",
                "Take the Case File with you as a PDF on the way out.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground/40 mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Center — the door, and the investor waiting behind it */}
        <div className="flex-1 flex flex-col items-center justify-center gap-7 -mt-6">
          {/* Headline — only on the closed-door landing */}
          {appState === 'idle' && (
            <div className="text-center animate-fade-in-up px-6">
              <h1 className="font-grotesk text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                Grill<span className="text-kill-red">Room</span>
              </h1>
              <p className="mt-3 text-[11px] md:text-xs uppercase tracking-[0.35em] text-muted-foreground/80 font-mono">
                Face the panel before you face investors
              </p>
            </div>
          )}

          {/* Stage: the boardroom panel waits; the door swings open to reveal the room */}
          <div className="relative w-[560px] max-w-[80vw] aspect-[4/3]" style={{ perspective: 1800 }}>
            <div className="absolute inset-0 overflow-hidden border border-[hsl(0,0%,9%)] bg-black">
              <Boardroom state={appState} />
            </div>
            <Door open={entered} onEnter={handleEnter} disabled={connecting} />
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-3 min-h-[2.5rem]">
            {appState !== 'idle' ? (
              <>
                <span
                  className={`text-[11px] uppercase tracking-[0.3em] font-mono transition-colors duration-500 ${
                    appState === 'searching' ? 'text-kill-amber'
                    : appState === 'roasting' && turns.length > 0 ? 'text-kill-red'
                    : 'text-white/80'
                  }`}
                >
                  {appState === 'searching' ? 'Panel Discussing !!'
                    : appState === 'roasting' ? (turns.length > 0 ? 'Delivering the Verdict !!' : 'Welcome to the Grill Room')
                    : 'The Panel Listens…'}
                </span>
                <button onClick={handleQuit} className="kill-button kill-button--roasting">
                  I am Grilled!
                </button>
              </>
            ) : connecting ? (
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 font-mono">
                Opening…
              </span>
            ) : showDownload ? (
              <button
                onClick={() => downloadReport(turns, companyName)}
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 font-mono hover:text-foreground transition-colors duration-200"
              >
                Download Case File
              </button>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 font-mono">
                Click the door to begin
              </span>
            )}
          </div>

          {error && (
            <p className="text-[11px] text-red-400/70 font-mono text-center max-w-xs">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 font-mono select-none">
            GrillRoom
          </span>
        </div>
      </div>

      {/* Right panel */}
      <SourcesPanel turns={turns} collapsed={panelCollapsed} onCollapsedChange={setPanelCollapsed} />

      {/* Company-name prompt — shown on open, name flows into the Case File */}
      {showNamePrompt && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in-up px-6">
          <div className="w-[360px] max-w-full border border-border bg-[hsl(0,0%,5%)] p-7 shadow-2xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-kill-red/80 font-mono mb-3">Before you step in</p>
            <h2 className="font-grotesk text-xl font-semibold text-foreground mb-5">What's your company called?</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCompanyName((v) => v.trim());
                setShowNamePrompt(false);
              }}
            >
              <input
                autoFocus
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme AI"
                maxLength={40}
                className="w-full bg-transparent border border-border px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-muted-foreground mb-5"
              />
              <div className="flex justify-end">
                <button type="submit" className="kill-button">Continue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Film-grain overlay — cinematic texture over the whole screen */}
      <div
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
