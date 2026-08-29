---
name: feedback-ui
description: Applies the BizCoach customer feedback UI—mobile-first QR-style flow, 1–5 rating, category, rule-based adaptive question, optional comment/voice, and thank-you. Use when editing CustomerFlow, RatingScreen, TopicScreen, AdaptiveQuestion, ThankYouScreen, landing/QR, customer CSS, or feedback UX tokens.
---

# Feedback UI

Customer path only. Do not apply to `#/dashboard`, `BusinessDashboard`, or `business-ui` dashboard cards.

Match a clean, premium, friendly mobile experience. One decision per screen. Keep the complete flow around 10 seconds.

## When to apply

- Default app route (`App` → `CustomerFlow`)
- Customer screens under `src/components/customer/`
- Landing/QR entry if added
- Customer CSS tokens and tap-target / spacing work

## Product flow

QR Scan → Rating → Category → Adaptive Question → Optional Comment → Thank You

Live start is **Rating** until a landing screen exists.

Code path: Rating tap → Topic tap → Adaptive (comment or skip) → Thank You.

## UX rules

- Mobile-first customer experience
- Keep customer interaction extremely simple
- Rating selection should immediately continue to the next screen
- Make comments optional
- Use clear visual hierarchy
- Friendly, modern, trustworthy design
- Avoid unnecessary animations
- Avoid dark/neon gaming aesthetics

## Visual direction

- Light page background (`--color-bg`)
- Centered single column, full viewport height
- Generous screen padding (~40px 24px)
- Titles 22–24px / 600 (20px on very small screens)
- Body 14–16px
- Primary purple CTAs
- Teal thank-you success
- Red (`--color-negative`) only for errors, destructive Stop, and limits
- Do not use dashboard orange problem-card treatment here

## Map to this repo

- Orchestration: `src/components/customer/CustomerFlow.tsx`
- Screens: `RatingScreen`, `TopicScreen`, `AdaptiveQuestion`, `ThankYouScreen`
- Types: `src/types.ts` (`Screen`, `FeedbackData`, `TopicOption`)
- Limits: `src/constants.ts` (2000 chars / warn 1800; 2-minute recording)
- Adaptive copy is rule-based in `CustomerFlow`, not an LLM
- Tokens: `:root` in `src/index.css`
- Prefer CSS modules + CSS variables. Do not add a styling library
- Token usage: [tokens.md](tokens.md)
- Screen recipes: [components.md](components.md)

## Gaps vs current code

- No QR/landing screen; `LandingScreen.module.css` is unused
- Topic tap advances immediately; selected-topic CSS exists but is unused
- Topic hover/selected tints hardcode `#f0f4ff` / `#e8edff`
- Feedback is not submitted or persisted; state stays in React

## Do not

- Add dashboard cards or generic admin chrome
- Insert extra steps before thank-you
- Require a comment
- Block continue on voice/mic
- Call the LLM API from React
- Scatter hex values in CSS modules
