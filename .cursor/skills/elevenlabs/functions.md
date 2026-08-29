# Netlify function contracts

Bundler: `esbuild` (`netlify.toml`). Handlers export `handler(event)`.

## `realtime-token.ts`

GET only (else 405).

1. Read `ELEVENLABS_API_KEY`; if missing → `503` `{ success: false, error: 'Speech-to-text is not configured on the server.' }`
2. `POST https://api.elevenlabs.io/v1/single-use-token/realtime_scribe` with `xi-api-key`
3. Parse `{ token?: string }`. Missing token or non-OK → `502` generic session error
4. Success `200`: `{ success: true, token, languageCode: 'eng' }` (`LANGUAGE_CODE` constant)

Client: `src/api/realtimeScribe.ts` → `useRealtimeScribe`.

## `speech-to-text.ts`

POST only (else 405). Multipart via Busboy: one file, `MAX_FILE_SIZE` 10MB.

1. Missing key → same `503` as above
2. Parse failure or empty buffer → `400` user-safe upload error
3. `FormData` to ElevenLabs: `file` blob + `model_id` = `scribe_v2`
4. Non-OK or missing `text` → `502` (log status/body server-side)
5. Success `200`: `{ success: true, text }`

Client: `src/api/speechToText.ts` (`transcribeRecording`). Used by `src/dev/SpeechToTextTest.tsx` (`#/speech-test`).

## Response JSON

Always `Content-Type: application/json`.

```json
{ "success": true, "token": "<single-use>", "languageCode": "eng" }
{ "success": true, "text": "<transcript>" }
{ "success": false, "error": "<user-safe string>" }
```

## Realtime WebSocket (not a Netlify function)

Auth is the single-use token from `realtime-token`, query param `token`. PCM 16-bit LE base64 in `input_audio_chunk`. Manual commit on stop. Treat `insufficient_audio_activity` as a quiet end, not a hard UI error.

Do not proxy the WebSocket through Netlify unless replacing this design.
