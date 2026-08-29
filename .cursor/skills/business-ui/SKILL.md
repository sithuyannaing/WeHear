---
name: business-ui
description: Applies the BizCoach business dashboard design system—light premium SaaS cards, Inter typography, purple/teal/orange color semantics, and reusable dashboard components. Use when building or restyling the business dashboard, #/dashboard, DashboardHeader, SatisfactionScoreCard, InsightCard, ProblemCard, PositiveFeedbackCard, AIRecommendationCard, TrainingCard, badges, buttons, CSS tokens, or theme work.
---

# Business UI

Match the design language of the attached dashboard screenshot, not the pixels. Do not clone screenshot copy, exact donut geometry, or illustration art. Preserve composition, hierarchy, and token usage.

## When to apply

- Business dashboard UI (`#/dashboard`, `BusinessDashboard`)
- New dashboard screens that should share this language
- Extracting or extending theme tokens
- Restyling toward the screenshot visual direction

## Visual direction

- Modern SaaS dashboard
- Clean, premium, friendly
- White/light background
- Soft borders
- Subtle shadows
- Rounded cards
- Purple as primary/action color
- Teal for positive/success information
- Orange for warnings/problem states
- Neutral dark navy text
- Avoid excessive gradients or decoration
- Prioritize clarity over visual complexity

## Typography

Use `--font-sans` for all UI text.

Use the existing typography tokens:
- `--text-page-title` → dashboard/page title
- `--text-card-title` → card and section headlines
- `--text-body` → primary content
- `--text-secondary` → supporting/meta text
- `--text-label` → eyebrow/section labels
- `--text-kpi` → primary metrics

Use only font weights 400, 500, 600, 700.
Do not introduce additional font families or font-weight values.

Use typography tokens consistently rather than hardcoding font sizes.

## Spacing

- Base spacing unit: 4px
- Card padding: 16px
- Major feature card padding: 20px
- Card gap: 12px
- Section gap: 14–16px
- Keep vertical rhythm consistent
- Avoid excessive empty space
- Preserve generous spacing inside the main AI recommendation card

## Components to create

DashboardHeader
- Establishes page context and business identity.

SatisfactionScoreCard
- Primary KPI.
- Score should be immediately scannable.
- Trend/supporting information sits secondary to the score.

InsightCard
- Converts raw feedback into a concise natural-language insight.

ProblemCard
- Represents the most important negative signal.
- Uses warning semantics.

PositiveFeedbackCard
- Represents what customers value.
- Uses positive semantics.

AIRecommendationCard
- Primary decision/action area.
- Uses primary/coach semantics.
- Contains recommendation, supporting rationale, and primary CTA.

TrainingCard
- Secondary follow-up action.
- Visually subordinate to AIRecommendationCard.

Badge / Chip
- Compact status/context information.

PrimaryButton
- Main action.

SecondaryButton
- Supporting/non-primary action.

## Card styling

- Border radius: 14–16px
- Border: subtle 1px neutral border
- Soft shadow
- White card background
- Consistent padding
- Use accent borders only when they communicate meaning

## Buttons

- Primary button height: ~48px
- Radius: 10–12px
- Strong purple primary CTA
- Clear hover/focus states
- Don't make buttons unnecessarily oversized

## Color semantics

- Primary/action: purple
- Positive: teal/green
- Warning/problem: orange
- Neutral: gray
- Keep accent colors intentional and consistent

## UX hierarchy

The user should visually understand this sequence:
Customer feedback
→ Main problem
→ AI insight
→ Recommended action
→ Training/actionable follow-up

The AI recommendation should remain the strongest visual focus after the main KPI.

## Responsive behavior

- Desktop: two-column cards where appropriate
- Tablet: reduce gaps and card widths
- Mobile: stack cards vertically
- Preserve the same visual hierarchy on every breakpoint

## Implementation

- Extract design tokens into a central theme/token file
- Build reusable components
- Avoid hardcoding styles repeatedly
- Use consistent spacing/radius/type tokens
- Keep the codebase easy to extend for additional dashboard screens

## Map to this repo

- Tokens: extend `:root` in `src/index.css`. Do not scatter hex values in CSS modules.
- Current UI: `src/components/dashboard/BusinessDashboard.tsx` + `src/components/dashboard/BusinessDashboard.module.css`
- Prefer CSS modules + CSS variables. Do not add a styling library.
- Render structured analysis fields only. Do not use AI-generated prose as layout.
- Full token list: [tokens.md](tokens.md)
- Component recipes: [components.md](components.md)

## Gaps vs current code

- Page currently uses decorative radial gradients. Remove or avoid them; avoid excessive gradients.
- Problem/warning states must use orange (`--color-warning`), not `--color-negative` red.
- When implementing UI, split the monolith into the named components above.

## Hierarchy check

KPI → Insight → Problem/Love → AI Recommendation → Training
After the satisfaction KPI, `AIRecommendationCard` is the densest and strongest card. `TrainingCard` is the follow-up action.

## Loading & Motion

### Dashboard Loading

Use dashboard skeleton loading as the default loading state.

Skeletons should mirror the final dashboard structure and approximate content dimensions.

Use skeleton states for:
- DashboardHeader
- SatisfactionScoreCard
- InsightCard
- ProblemCard
- PositiveFeedbackCard
- AIRecommendationCard
- TrainingCard

Use a subtle shimmer or opacity animation.
Do not use a large centered spinner for full-dashboard loading.

### Component Loading

For small asynchronous actions:
- Use inline loading states.
- Disable the active button while loading.
- Preserve the button label/layout where practical.
- Use a small spinner only for localized actions.

Do not replace an entire dashboard with a generic spinner.

### Motion

Motion should be subtle, functional, and consistent.

Use:
- `--transition-fast` for hover/focus interactions.
- `--transition-normal` for UI state transitions.
- Skeleton animation around 1.5–2 seconds.
- Subtle 200–300ms entrance transitions.
- Optional 500–700ms KPI count-up on initial display.

Avoid:
- Bouncing cards.
- Excessive scale animations.
- Animated gradients.
- Continuous decorative motion.
- Large entrance animations.

Honor `prefers-reduced-motion`.

When reduced motion is enabled, remove or minimize:
- Entrance movement.
- KPI count-up.
- Decorative animation.
- Skeleton shimmer where appropriate.

## Accessibility

Follow practical WCAG-friendly UI patterns without compromising the visual design.

### Contrast
- Ensure primary text and important UI text have sufficient contrast against their backgrounds.
- Do not rely on color alone to communicate meaning.
- Problem, positive, and status states should include text or an icon in addition to color.

### Keyboard
- All interactive elements must be keyboard accessible.
- Use native `<button>`, `<a>`, `<input>`, and other semantic elements where appropriate.
- Do not create clickable `<div>` elements when a semantic element exists.
- Provide visible `:focus-visible` states.

### Buttons & Controls
- Buttons must have clear accessible labels.
- Icon-only buttons require an accessible name (`aria-label` when appropriate).
- Disabled/loading states must remain understandable.

### Forms
- Inputs must have associated labels.
- Validation/error messages should be understandable and associated with the relevant field.

### Structure
- Use semantic HTML and logical heading hierarchy.
- Preserve meaningful reading order on responsive layouts.

### Screen Readers
- Decorative icons/images should be hidden from assistive technology where appropriate.
- Meaningful images require useful alternative text.
- Do not duplicate visible text unnecessarily with ARIA labels.

## Do not

- Dark or neon aesthetics
- Generic admin-dashboard chrome
- Oversized buttons
- Hardcoded one-off colors
- Extra animation beyond existing reduced-motion-safe patterns
