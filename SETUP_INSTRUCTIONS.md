# Setup Instructions

This document covers the full setup from scratch — ElevenAgents configuration, Firecrawl wiring, and local development.

---

## Architecture

```
Browser (mic)
     ↓
ElevenAgents (STT → LLM)
     ↓  calls set_searching_state (Client Tool)
Frontend UI → amber searching state
     ↓  calls firecrawl_search (Server Tool / Webhook)
Firecrawl API (https://api.firecrawl.dev/v2/search)
     ↓  returns live web + news results
ElevenAgents LLM synthesises the roast
     ↓
ElevenAgents TTS speaks the roast
     ↓
Browser receives audio → red roasting state
```

**No conversational backend.** ElevenLabs Agents owns the full voice loop: STT → tool calls → synthesis → TTS. A small Node server (`server/index.js`) only issues signed session URLs and serves the built frontend — see [docs/DEPLOY_VPS.md](docs/DEPLOY_VPS.md).

---

## Phase 1 — ElevenAgents Configuration

Everything in this phase is done in the [ElevenLabs console](https://elevenlabs.io/app/agents). No code.

### Step 1.1 — Create the Agent

1. Go to **elevenlabs.io/app/agents** → **Create Agent**
2. Name it (e.g. `GrillRoom`)
3. **Voice:** pick something sharp and confident — `Charlie` or `Daniel` work well
4. **TTS Model:** `eleven_flash_v2_5`
5. **LLM:** `gpt-4o`, `claude-sonnet`, or `gemini-2.5-flash`
6. **Visibility:** Public — the frontend passes `agentId` directly, no signed URL needed in dev

### Step 1.2 — System Prompt

Set the agent's system prompt in the ElevenLabs console. (The live prompt is maintained directly in the console — it is the source of truth and is not committed to this repo.)

Key behaviours enforced by the prompt:
- Always calls `set_searching_state` silently before searching
- Always calls `firecrawl_search` immediately after
- Always calls `show_sources` with the results before speaking
- Delivers a brutal, evidence-backed roast in max 3 sentences
- No hedging, no encouragement, no filler

### Step 1.3 — Register Client Tool: `set_searching_state`

**Tools → Add Tool → Type: Client**

| Field | Value |
|-------|-------|
| Name | `set_searching_state` |
| Description | `Call this silently before firecrawl_search to signal the UI to show a searching state. No parameters.` |
| Wait for response | **ON** |
| Parameters | _(none)_ |

This is handled in the React frontend. When the agent calls it, the UI transitions to the amber searching state.

### Step 1.4 — Register Client Tool: `show_sources`

**Tools → Add Tool → Type: Client**

| Field | Value |
|-------|-------|
| Name | `show_sources` |
| Description | `Call this after firecrawl_search to send sources to the UI before delivering the roast.` |
| Wait for response | **ON** |

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `idea` | string | The startup idea as a short phrase, e.g. "AI Podcast Summarizer" |
| `sources` | string | Pipe-and-double-semicolon formatted results: `"Title 1\|URL1\|Description 1;;Title 2\|URL2\|Description 2;;..."` |

This is also handled in the React frontend — it parses the sources string and appends a new turn to the right panel.

### Step 1.5 — Register Server Tool: `firecrawl_search`

**Tools → Add Tool → Type: Webhook**

| Field | Value |
|-------|-------|
| Name | `firecrawl_search` |
| URL | `https://api.firecrawl.dev/v2/search` |
| Method | `POST` |
| Wait for response | **ON** |

**Headers:**

| Name | Type | Value |
|------|------|-------|
| `Authorization` | Secret | `Bearer YOUR_FIRECRAWL_API_KEY` |
| `Content-Type` | Static | `application/json` |

**Body parameters:**

| Name | Type | Value type | Required | Description |
|------|------|------------|----------|-------------|
| `query` | string | LLM Prompt | Yes | A short, natural search query — e.g. `"{idea} startup competitors funded"` |
| `limit` | number | Static | No | `3` |
| `sources` | array | Static | No | `["web", "news"]` |
| `tbs` | string | Static | No | `qdr:y` |

> `limit`, `sources`, and `tbs` are static so the LLM only needs to construct the `query`. `tbs: qdr:y` filters web results to the past 12 months, ranked by relevance.

### Step 1.6 — Test in ElevenLabs Console

1. Open the agent's built-in test widget
2. Say: *"I have a startup idea — an AI app that summarizes podcasts"*
3. Expected sequence in the Conversations transcript:
   - `set_searching_state` called (no params)
   - `firecrawl_search` called with a targeted query
   - `show_sources` called with results
   - Agent speaks a brutal roast
4. If tools don't fire: check the system prompt tool-call sequence and tool descriptions

---

## Phase 2 — Local Development

### Prerequisites

- Node.js 18+
- ElevenLabs account with the agent configured above
- Firecrawl API key (used only inside ElevenLabs console as a secret — never in code)

### Step 2.1 — Clone and install

```bash
git clone https://github.com/<your-username>/grillroom.git
cd grillroom
npm install
```

### Step 2.2 — Environment variables

Create `.env.local` at the project root:

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_agent_id
```

Get the Agent ID from the ElevenLabs console — it's in the agent settings URL or the overview page.

> `ELEVENLABS_API_KEY` is used server-side only (Vercel Edge function / Vite middleware) to generate signed session URLs. It never touches the browser.

### Step 2.3 — Run locally

```bash
npm run dev
# http://localhost:5173
```

The Vite dev server includes a middleware that proxies signed URL requests to ElevenLabs so your API key stays server-side.

### Step 2.4 — Test end-to-end

1. Open `http://localhost:5173`
2. Click **Grill Room** — allow mic access
3. Speak an idea
4. Expected flow:
   - The door swings open, revealing the boardroom panel (listening)
   - The panel huddles and "Panel Discussing !!" shows (searching) — Firecrawl is live
   - Sources appear in the right panel
   - A panel member points and delivers the verdict (roasting)
5. After **I am Grilled!** — door closes, Download Case File button appears

---

## Project Structure

```
GrillRoom/
├── src/
│   ├── App.tsx                      # Root component — stage, controls, Case File PDF
│   ├── types.ts                     # AppState, Turn, Source types + parseSources
│   ├── index.css                    # Global styles
│   ├── main.tsx                     # Entry point
│   ├── components/
│   │   ├── Door.tsx                 # The wall + door that swings open
│   │   ├── Boardroom.tsx            # Backlit investor panel, reacts to state
│   │   └── SourcesPanel.tsx         # Right panel — sources per turn, collapsible
│   ├── hooks/
│   │   └── useAppConversation.ts    # ElevenLabs SDK wrapper + state machine
│   └── lib/
│       └── utils.ts                 # Utility functions
├── server/
│   └── index.js                    # Node/Express — serves the build + signed session URLs (prod)
├── api/
│   └── signed-url.ts               # Vercel Edge function (alternative host; VPS uses server/)
├── public/
│   └── favicon.svg
└── docs/
    └── DEPLOY_VPS.md               # VPS deployment guide
```

> The agent's system prompt lives in the ElevenLabs console (source of truth) and is not committed to this repo.

---

## UI State Machine

| State | Scene | Trigger |
|-------|-------|---------|
| `idle` | Door closed | Session not started / ended |
| `listening` | Panel calm, cool light | Connected — mic open |
| `searching` | Panel huddles, "Panel Discussing !!" | `set_searching_state` client tool fires |
| `roasting` | Speaker points, red light, verdict | Agent speaking |

