// Production server for VPS deployment.
// Serves the built frontend (../dist) and the /api/signed-url endpoint,
// keeping ELEVENLABS_API_KEY server-side. Replaces the Vercel edge function
// in api/signed-url.ts (which only runs on Vercel).
//
// Env vars (inject via systemd EnvironmentFile — never commit them):
//   ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, PORT (optional, default 8787)

import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8787;
const { ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID } = process.env;

// Trust the nginx reverse proxy so rate limiting sees real client IPs.
app.set('trust proxy', 1);

// Abuse guard: cap how often a single IP can start new (billed) sessions.
const signedUrlLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,                  // 10 session starts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sessions. Please try again later.' },
});

app.get('/api/signed-url', signedUrlLimiter, async (_req, res) => {
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
      { headers: { 'xi-api-key': ELEVENLABS_API_KEY } }
    );
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to get signed URL' });
    }
    const { signed_url } = await response.json();
    res.json({ signedUrl: signed_url });
  } catch {
    res.status(502).json({ error: 'Failed to get signed URL' });
  }
});

// Serve the built frontend and fall back to index.html for client-side routing.
const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(PORT, () => console.log(`GrillRoom server listening on :${PORT}`));
