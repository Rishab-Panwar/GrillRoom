<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="GrillRoom logo" />

# GrillRoom

**Face the panel before you face investors.**

A voice-native AI investor panel. Speak your pitch out loud — GrillRoom searches the live web for real competitors, recent funding rounds, and startups that already died doing exactly what you're describing, then throws it back at you in real time. Better to be torn apart here than across a real boardroom table.

[![Voice ElevenLabs](https://img.shields.io/badge/Voice-ElevenLabs-orange?style=flat-square)](https://elevenlabs.io) [![Search Firecrawl](https://img.shields.io/badge/Search-Firecrawl-green?style=flat-square)](https://firecrawl.dev) [![Frontend React+TS](https://img.shields.io/badge/Frontend-React+TS-blue?style=flat-square)](https://react.dev) [![Hosting Vercel](https://img.shields.io/badge/Hosting-Vercel-black?style=flat-square)](https://vercel.com) [![Live grillroom.rishabai.me](https://img.shields.io/badge/Live-grillroom.rishabai.me-red?style=flat-square)](https://grillroom.rishabai.me)

</div>

---

## How it works

1. **Name your company.** A prompt on open captures it — it headlines your Case File.
2. **Click the door.** It swings open onto a backlit boardroom — allow mic access.
3. **Pitch out loud.** The panel listens in real time.
4. **They deliberate.** As you speak, GrillRoom searches the live web for rivals, failed clones, and funding reality — the panel huddles ("Panel Discussing") while it digs.
5. **The verdict.** A panel member points at you and delivers a blunt, evidence-backed takedown; sources appear in the side panel as they're found.
6. **The Case File.** Download a PDF — titled with your company name — holding the verdict and every source cited.

The panel's mood tracks the conversation — calm while listening, amber while deliberating, red when the verdict lands.

---

## How the search works

Firecrawl Search is wired into the ElevenLabs agent as a live webhook, called on every conversation. It's deliberately constrained:

- **Web + news, capped per call** — enough evidence to land a verdict, not enough to drown the agent in context.
- **Past 12 months** — stale data gives founders an out; fresh data doesn't.
- **Targeted queries** — every search aims at one of: existing competitors, funding scale, or startups that already died doing this.

The tight context window is the design — a conversational agent performs best given the right amount of information, not the most.

---

## Built with

| | |
|---|---|
| **[ElevenLabs Agents](https://elevenlabs.io/docs/agents-platform/overview)** | The full voice pipeline — speech-to-text, LLM, text-to-speech, turn-taking, and tool orchestration. Session/silence limits are enforced server-side in the agent config. |
| **[Firecrawl Search](https://docs.firecrawl.dev/features/search)** | Live web + news search, wired into the agent as a webhook — real results, not cached. |
| **Vite + React + TypeScript** | The frontend, including the door + boardroom scene rendered entirely in SVG/CSS. |
| **Vercel** | Hosting — the static frontend plus an edge function (`api/signed-url`) that mints signed session URLs so the API key stays server-side. Auto-deploys on push. |

---

## Setup & deploy

- **[Setup instructions](SETUP_INSTRUCTIONS.md)** — ElevenLabs agent config, Firecrawl wiring, and local dev.
- **Deployment:** hosted on **Vercel**. The `api/signed-url` edge function runs automatically; set `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` as project environment variables. Every push to `main` redeploys.
- **Self-hosting alternative:** **[VPS deployment](docs/DEPLOY_VPS.md)** — a bundled Node/Express server (`server/index.js`) behind nginx, if you'd rather host it yourself.

> The agent's system prompt lives in the ElevenLabs console (the source of truth) and is not committed to this repo.
