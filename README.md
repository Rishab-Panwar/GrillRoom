# GrillRoom

> Pitch your startup to a room that isn't here to clap.

**GrillRoom** is a voice-native, adversarial AI panel that grills your startup idea the way investors actually will. Step through the door, pitch out loud, and a panel of investors interrogates you — pulling live evidence on real competitors, recent funding rounds, and startups that already died doing exactly what you're describing, then throwing it back at you in real time.

Most founders avoid market research because it's painful to learn your idea already exists. GrillRoom makes that reckoning fast and unavoidable — better to be torn apart here than across a real boardroom table.

---

## How it works

1. **Click the door.** It swings open onto a backlit boardroom — allow mic access.
2. **Pitch out loud.** The panel listens in real time.
3. **They deliberate.** As you speak, GrillRoom searches the live web for rivals, failed clones, and funding reality — the panel huddles while it digs.
4. **The verdict.** A panel member points at you and delivers a blunt, evidence-backed takedown; sources appear in the side panel as they're found.
5. **The Case File.** Download a PDF with the verdict and every source cited.

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
| **[ElevenLabs Agents](https://elevenlabs.io/docs/agents-platform/overview)** | The full voice pipeline — speech-to-text, LLM, text-to-speech, turn-taking, and tool orchestration. |
| **[Firecrawl Search](https://docs.firecrawl.dev/features/search)** | Live web + news search, wired into the agent as a webhook — real results, not cached. |
| **Vite + React + TypeScript** | The frontend, including the door + boardroom scene rendered in SVG/CSS. |
| **Node (Express)** | A small server that issues signed session URLs and serves the build, deployed on a VPS behind nginx. |

---

## Setup & deploy

- **[Setup instructions](SETUP_INSTRUCTIONS.md)** — agent config, Firecrawl wiring, and local dev.
- **[VPS deployment](docs/DEPLOY_VPS.md)** — Node server, nginx, systemd, and SSL.
