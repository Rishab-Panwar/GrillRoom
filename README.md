# GrillRoom

> Face the panel before you face investors.

**GrillRoom** is a voice-native, adversarial AI panel that grills your startup idea the way investors actually will. Step through the door, pitch out loud, and a panel of investors interrogates you — pulling live evidence on real competitors, recent funding rounds, and startups that already died doing exactly what you're describing, then throwing it back at you in real time.

Most founders avoid market research because it's painful to learn your idea already exists. GrillRoom makes that reckoning fast and unavoidable — better to be torn apart here than across a real boardroom table.

🔗 **[grillroom.rishabai.me](https://grillroom.rishabai.me)**

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
