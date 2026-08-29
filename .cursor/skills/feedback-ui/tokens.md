# Design tokens (customer flow)

Single source of truth: `:root` in `src/index.css`. Consume via `var(...)` in customer CSS modules. Do not invent a second token file. Do not scatter hex.

Shared with the rest of the app; **usage** below is customer-only. Do not copy dashboard card/KPI/type scale here.

## Color

| Token | Customer use |
| --- | --- |
| `--color-bg` | Full-flow page background |
| `--color-surface` | Topic tiles, textarea, outlined buttons |
| `--color-text` | Titles, tile labels, primary body |
| `--color-text-muted` | Subtitles, rating numbers, skip, placeholders, thank-you message |
| `--color-primary` | Continue, Type it instead, progress fill, topic hover border, textarea focus |
| `--color-primary-hover` | Primary button hover |
| `--color-primary-soft` | Topic hover/selected fill (replace `#f0f4ff` / `#e8edff` when the token exists) |
| `--color-positive` | Thank-you checkmark circle |
| `--color-negative` | Errors, Stop, char/time limits, listening emphasis |
| `--color-border` | Topic/textarea/mic outline, progress track |

Do not use dashboard `--color-warning` orange for customer problem cards. This flow has no problem cards.

## Type

`--font-sans` is Inter. Prefer 500 and 600 on this flow (titles 600).

| Role | Size | Weight |
| --- | --- | --- |
| Screen title | 22–24px (20px under 400px) | 600 |
| Rating number / topic label | 14px | 500 |
| Subtitle / skip | 14px | 400–500 |
| Thank-you message | 16px | 400 |
| Primary / mic actions | 16px | 600 |
| Char counter | 13px | 400; 600 when near limit |

## Space and layout

| Token / value | Use |
| --- | --- |
| Screen padding `40px 24px` | All customer screens |
| Screen gap `32–40px` | Stacked title + controls |
| Content max-width `~360px` | Grid, textarea, actions |
| Rating gap `16px` (`10px` under 400px) | Emoji row |
| Topic grid | 2 columns, gap `12px` |
| Topic tile padding | `20px 12px` |
| Action row gap | `12px` |

## Radius and motion

| Token | Use |
| --- | --- |
| `--radius-md` | Rating hit area, topic tiles, textarea, buttons |
| `--radius-full` | Optional landing CTA; thank-you check is a circle |
| `--transition-fast` | Hover/focus/active only |

Honor `prefers-reduced-motion`. Avoid extra animation.

## Tap targets

- Rating emoji ~40px; button padding ~12px (8px under 400px)
- Topic tiles: padding `20px 12px`, full-cell hit area
- Primary / skip / mic: padding ~`14px 24px`
