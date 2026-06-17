# Changelog

## 2026-06 — GrillRoom

A voice-native investor panel that grills your startup idea using live web evidence.

### Experience
- **Door + boardroom UI** — click the door to step into a backlit boardroom; a panel of investor silhouettes reacts to the conversation (huddles while deliberating, points at you while delivering the verdict).
- **Voice-first** — pitch out loud; the panel listens, searches, and responds in real time.
- **Live evidence** — Firecrawl web + news search surfaces real competitors, funding, and failed clones, cited in the side panel as they're found.
- **Case File** — downloadable PDF containing the verdict and every source cited.

### Engineering
- ElevenLabs Agents for the full voice pipeline (STT, LLM, TTS, turn-taking, tools).
- Firecrawl wired as a live webhook; results passed to the UI with a `;;`-delimited source contract.
- Node (Express) server issues signed session URLs and serves the build; deployed on a VPS behind nginx.
- Session limits (silence/idle end, max duration) enforced server-side in the agent config.
