# Design tokens

Single source of truth: `:root` in `src/index.css`. Extend that file. Do not invent a second token source. Consume tokens from CSS modules via `var(...)`.

Existing names to keep and align: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-hover`, `--color-positive`, `--color-border`, `--color-shadow`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`, `--font-sans`.

## Color

| Token | Role | Target |
| --- | --- | --- |
| `--color-bg` | Page background | Light off-white (`#f8f9fb`) |
| `--color-surface` | Card background | White |
| `--color-text` | Primary text | Dark navy (`#1a1a2e`) |
| `--color-text-muted` | Secondary text / labels | Medium gray-navy (`#556080`) |
| `--color-primary` | Action / coach | Purple |
| `--color-primary-hover` | Primary hover | Darker purple |
| `--color-primary-soft` | Primary tint fills (pills, “why this matters”) | Light purple tint |
| `--color-positive` | Success / love | Teal (`#2ec4b6`) |
| `--color-positive-soft` | Positive tint fills | Light teal tint |
| `--color-warning` | Problem / high impact | Orange |
| `--color-warning-soft` | Warning tint fills | Light orange tint |
| `--color-border` | Default 1px card/button border | Neutral (`#e5e7eb`) |
| `--color-shadow` | Soft card shadow color | `rgba(0, 0, 0, 0.08)` |

`--color-negative` (red) is not a dashboard semantic. Use `--color-warning` for problem states.

Accent borders only when they communicate meaning: warning on `ProblemCard`, positive on `PositiveFeedbackCard`, primary on `AIRecommendationCard` if needed. Default cards use `--color-border` only.

## Type

`--font-sans` is Inter with system fallbacks. Weights: 400, 500, 600, 700 only.

| Token | Size | Weight | Use |
| --- | --- | --- | --- |
| `--text-page-title` | 28px | 700 | Dashboard greeting |
| `--text-card-title` | 18–20px | 700 | Card headlines |
| `--text-body` | 14–16px | 400–500 | Main content |
| `--text-secondary` | 13–14px | 400–500 | Meta, supporting lines |
| `--text-label` | 10–11px | 600 | All-caps section labels; slight letter-spacing |
| `--text-kpi` | 30–32px | 700 | Satisfaction score |

## Space (4px base)

| Token | Value | Use |
| --- | --- | --- |
| `--space-1` | 4px | Base unit |
| `--space-2` | 8px | Tight clusters |
| `--space-3` | 12px | Card gap |
| `--space-4` | 16px | Card padding; section gap high end |
| `--space-5` | 20px | Major feature card padding (`AIRecommendationCard`) |
| `--space-section` | 14–16px | Vertical gap between stacked sections |

Keep vertical rhythm on `--space-3` / `--space-4`. Avoid large empty regions. Keep inner padding generous on the AI recommendation card (`--space-5`).

## Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 8px | Small inner chips if needed |
| `--radius-md` | 10–12px | Buttons (prefer 12px = existing `--radius-md`) |
| `--radius-lg` | 14–16px | Cards (existing `--radius-lg` is 16px) |
| `--radius-full` | 9999px | Pills, badges, business chip |

## Shadow

One card shadow:

```css
--shadow-card: 0 8px 24px var(--color-shadow);
```

Apply to dashboard cards. Do not stack multiple decorative shadows.

## Motion

Use:
- `--transition-fast` for hover/focus interactions
- `--transition-normal` for component state transitions

Loading skeletons use their own slow continuous animation (~1.5–2s).

Entrance animations should remain subtle and short (~200–300ms).

Honor `prefers-reduced-motion`.
