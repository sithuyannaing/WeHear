# Customer screens

Keep API/LLM out of these components. One decision per screen. Shared shell: full-viewport `.screen` column, centered, light `--color-bg`.

Suggested home: `src/components/customer/` with colocated CSS modules using tokens from `src/index.css`.

---

## 1. CustomerFlow

State machine only. Own `Screen` and `FeedbackData`. Do not put layout chrome here beyond `CustomerFlow.module.css` `.flow`.

Adaptive rules stay here:

- Rating ≤ 2: “What could we improve?” plus apology
- Rating 3: “How could we make your next experience better?”
- Rating ≥ 4: “What did you like most?”

Pass `question` / `apology` into `AdaptiveQuestion`. Skip with empty comment is valid.

## 2. LandingScreen (if added)

QR-friendly first step. One title, one primary CTA (existing unused `LandingScreen.module.css` as a start). Then Rating. Do not add extra copy or cards.

## 3. RatingScreen

“How did we do today?” plus 1–5 (emoji + number). `onNext(rating)` on tap. No confirm. Subtitle can note it is quick. Shrink gap/type under 400px.

## 4. TopicScreen

“What would you like to tell us about?” Two-column grid of `TopicOption` (id, label, icon). Tap calls `onNext(topic.id)` immediately. Optional `data-selected` styles exist; do not add a second confirm step. Hover/selected fills via `--color-primary-soft`, not hardcoded hex.

## 5. AdaptiveQuestion

Optional comment. Show `apology` when provided. Title is the adaptive `question`.

- Textarea: optional, `maxLength` from `MAX_COMMENT_CHARS`, counter; warning style at `WARN_COMMENT_CHARS`
- Continue: enabled only when trimmed text is non-empty
- Skip: always available unless recording is busy; proceeds with no comment
- Voice (`useRealtimeScribe`): Speak / Stop, live partial, 2-minute cap. Never required. Mic denied or error → type fallback. Do not block Skip/Continue on voice support

## 6. ThankYouScreen

Teal circular check (`--color-positive`), “Thank you!”, short muted message. No further actions required for MVP.

---

## Shared patterns

- Primary fill button: `--color-primary`, white text, `--radius-md`, hover `--color-primary-hover`
- Skip / text button: muted, no heavy chrome
- Outlined secondary: surface + 2px border (mic, retry, topic tiles)
- Destructive Stop: `--color-negative`, white text
- Focus: 2px primary border on textarea; visible focus on buttons
