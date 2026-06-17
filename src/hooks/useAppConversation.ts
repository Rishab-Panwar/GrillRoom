import { useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { AppState, Turn } from '../types';
import { parseSources } from '../types';

// Session limits (silence/idle end, max duration) are enforced server-side by the
// ElevenLabs agent config — that stops billing at the source and survives a
// backgrounded/throttled tab, so there's no client-side watchdog here.
export function useAppConversation() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    clientTools: {
      set_searching_state: () => {
        setAppState('searching');
        return 'ok';
      },
      show_sources: ({ idea: rawIdea, sources: rawSources }: { idea: string; sources: string }) => {
        setTurns((prev) => [...prev, { idea: rawIdea ?? '', sources: parseSources(rawSources ?? '') }]);
        return 'ok';
      },
    },
    onMessage: ({ message, source }: { message: string; source: string }) => {
      // Capture the agent's spoken verdict and attach it to the current turn
      // (the one show_sources just created). Greeting/chatter before any turn is ignored.
      if (source !== 'ai' || !message) return;
      setTurns((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const verdict = last.verdict ? `${last.verdict} ${message}` : message;
        return [...prev.slice(0, -1), { ...last, verdict }];
      });
    },
    onModeChange: ({ mode }: { mode: string }) => {
      if (mode === 'speaking') setAppState('roasting');
      if (mode === 'listening') setAppState('listening');
    },
    onStatusChange: ({ status }: { status: string }) => {
      if (status === 'disconnected') setAppState('idle');
    },
    onError: (err: unknown) => {
      setError(String(err));
      setAppState('idle');
    },
  });

  const startSession = async () => {
    setError(null);
    setTurns([]);
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const res = await fetch('/api/signed-url');
      if (!res.ok) throw new Error('Failed to get signed URL');
      const { signedUrl } = await res.json() as { signedUrl: string };

      await conversation.startSession({
        signedUrl,
        connectionType: 'websocket',
      });
      setAppState('listening');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
        setError('Microphone access denied. Please allow mic access and try again.');
      } else {
        setError('Failed to connect. Please try again.');
      }
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const endSession = async () => {
    await conversation.endSession();
    setAppState('idle');
  };

  return { appState, connecting, turns, startSession, endSession, error };
}
