---
name: elevenlabs
description: Installs ElevenLabs tooling and integrates ElevenLabs Scribe in this repo through Netlify Functions (API key server-side only). Use for installation ("Integrate with elevenlab", setting up @elevenlabs/* npm packages or ELEVENLABS_API_KEY), or when editing netlify/functions/speech-to-text, realtime-token, useRealtimeScribe, speechToText, realtimeScribe, AdaptiveQuestion voice, or ELEVENLABS_API_KEY.
---

# ElevenLabs (this repo)

Speech-to-text only. The browser never sends `ELEVENLABS_API_KEY`. Secrets live in Netlify / `.env`. React calls `/.netlify/functions/*`.

Generic Scribe API details: `.agents/skills/speech-to-text/` (do not duplicate here).

## Installation (this repo)

Only install what this JS/TS repo needs: the `@elevenlabs/*` npm packages and the `ELEVENLABS_API_KEY` env. Skip CLI and Python here.

### 1. Preflight

- `node --version` (needs ≥18) and `npm --version` must be present.
- Check current state: `Get-ChildItem node_modules/@elevenlabs` (if the dir exists, packages are already installed).
- Note: the existing integration uses raw `fetch`/WebSocket and intentionally installs **no** `@elevenlabs/*` packages. Only install the SDKs if the task explicitly asks to use them; otherwise leave `package.json` untouched.

### 2. Install npm packages (only if the SDK is required)

```powershell
npm install @elevenlabs/elevenlabs-js   # Node.js SDK (current: v2.65.x)
npm install @elevenlabs/client          # browser SDK, if used client-side
npm install @elevenlabs/react           # React SDK, ONLY if replacing the existing WebSocket hook
```

- Current versions (Aug 2026): `@elevenlabs/elevenlabs-js` 2.65.0, `@elevenlabs/client` 1.22.0, `@elevenlabs/react` 1.15.0.
- The legacy `elevenlabs` npm package is **deprecated** — do not install or import it. Migrate old imports to `@elevenlabs/*`.

### 3. API key + env

1. Create a key at elevenlabs.io → [API Keys](https://elevenlabs.io/app/settings/api-keys) (or use the `setup-api-key` skill).
2. `.env.example` must contain `ELEVENLABS_API_KEY=`. Set the real value in `.env` for local dev if not already present.
3. Set the **same name** in the Netlify site env (Functions read `process.env.ELEVENLABS_API_KEY`).

### 4. Verify

- Packages resolve: `node -e "require('@elevenlabs/elevenlabs-js')"`.
- Key reachable by Functions (never echo the secret).
- `npm run lint` and `npm run build` pass after any install.

## When to apply

- `netlify/functions/speech-to-text.ts` or `netlify/functions/realtime-token.ts`
- `src/api/speechToText.ts`, `src/api/realtimeScribe.ts`, `src/hooks/useRealtimeScribe.ts`
- Voice on `AdaptiveQuestion`, `#/speech-test`
- Env: `ELEVENLABS_API_KEY`

## Architecture

```text
React
  GET  /.netlify/functions/realtime-token   →  { token, languageCode }
  POST /.netlify/functions/speech-to-text   →  { text }
       ↓
Netlify Function  (xi-api-key)
       ↓
ElevenLabs  (scribe_v2 | single-use realtime token)
```

Customer comment voice uses **realtime**. Batch upload is the **dev test** path (`SpeechToTextTest`).

## Critical rules

- Never put `ELEVENLABS_API_KEY` in client code, Vite `VITE_*`, or committed files
- Upstream header is `xi-api-key`, not Bearer
- Do not add `@elevenlabs/react` unless replacing the existing WebSocket hook on purpose
- Voice is optional; typing and Skip must keep working (`feedback-ui`)
- Log upstream errors server-side; return generic `{ success: false, error }` to the client
- Missing key → `503`; bad upload → `400`; ElevenLabs failure → `502`

## Env

`.env.example`: `ELEVENLABS_API_KEY=`  
Set the same name in Netlify site env. Functions read `process.env.ELEVENLABS_API_KEY`.

Key setup/install steps: see [Installation](#installation-this-repo).

## Models and endpoints

| Path | Method | Upstream | Model |
| --- | --- | --- | --- |
| `/.netlify/functions/realtime-token` | GET | `POST https://api.elevenlabs.io/v1/single-use-token/realtime_scribe` | token for `scribe_v2_realtime` |
| `/.netlify/functions/speech-to-text` | POST multipart | `POST https://api.elevenlabs.io/v1/speech-to-text` | `scribe_v2` |

Realtime socket (browser, token in query):  
`wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&token=…&commit_strategy=manual&audio_format=pcm_16000&language_code=eng`

Language is fixed in the token function as `eng`. Keep client validation: `languageCode` matches `/^[a-zA-Z-]{2,10}$/`.

## Client contracts

**Token** (`src/api/realtimeScribe.ts`): `{ success: true, token: string, languageCode: string }`

**Batch** (`src/api/speechToText.ts`): FormData field `audio` (file). Success `{ success: true, text: string }`. Function accepts one multipart **file** part (any field name). Max 10MB.

**Hook** (`useRealtimeScribe`): fetch token → `getUserMedia` → PCM chunks `input_audio_chunk` → `stop()` sends remainder with `commit: true`, waits up to 2.5s for `committed_transcript`. Status: `unsupported | idle | connecting | recording | denied | error`.

JSON shapes and status codes: [functions.md](functions.md)

## Do not

- Call ElevenLabs with the API key from React
- Expose raw ElevenLabs error bodies to the UI
- Require mic for Continue/Skip
- Swap models without updating both the function and the WebSocket query
