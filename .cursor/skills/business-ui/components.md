# Dashboard components

Split `src/components/dashboard/BusinessDashboard.tsx` into focused components. Keep API calls out of presentational pieces. Bind UI to structured `Analysis` fields from `src/api/dashboard.ts` (`satisfactionScore`, `summary`, `positives`, `issues`, `recommendations`, `trainingTopic`). Do not invent layout from free-form AI prose.

Suggested home: `src/components/dashboard/` with colocated CSS modules that only use tokens from `src/index.css`.

## Layout recipe

Vertical feed, max-width container, section gap `--space-section`.

Order:

1. DashboardHeader
2. SatisfactionScoreCard (KPI)
3. InsightCard
4. ProblemCard + PositiveFeedbackCard (two columns on desktop)
5. AIRecommendationCard (strongest after KPI)
6. TrainingCard

Breakpoints:

- Desktop: two-column for Problem + Positive; full-width for KPI, insight, recommendation, training
- Tablet: same order; reduce gaps and card widths
- Mobile: stack all cards; keep the same visual hierarchy

## Shared card shell

White `--color-surface`, `--radius-lg`, 1px `--color-border`, `--shadow-card`, padding `--space-4` (16px). `AIRecommendationCard` uses `--space-5` (20px).

---

## 1. DashboardHeader

Greeting (page title tokens) + subtitle (secondary). Right: business-name pill (primary-soft fill, primary text, home icon) and muted “Updated …” timestamp. Flex; wrap on small screens.

## 2. SatisfactionScoreCard

Label: 10–11px / 600, uppercase, muted. Left: circular score treatment with restrained purple→teal stroke (clarity over decoration). Center KPI: `--text-kpi` plus muted `/100`. Right: teal trend chip, then sample-size line. Data: `satisfactionScore`, optional change and sample size.

## 3. InsightCard

Primary-soft sparkle badge (“Here’s what I found” or equivalent). Body: `summary` at `--text-body`. Do not restyle this as the primary CTA.

## 4. ProblemCard

Orange warning icon + warning label. Title: top issue name (`--text-card-title`). Footer chips: neutral mentions count; warning “High impact” (or mapped impact). Optional left accent border in `--color-warning`. Data: top issue frequency and impact.

## 5. PositiveFeedbackCard

Teal heart icon + positive label. Quoted top positive in teal italics. Optional short teal accent bar. Footer: mention count as secondary text. Optional left accent border in `--color-positive`. Data: top positive from `positives`.

## 6. AIRecommendationCard

Strongest visual focus after the KPI. Primary pill badge (coach). Subtitle: next-best-action. Action title from `recommendations` (`--text-card-title`). Inner highlight: `--color-primary-soft`, “Why this matters” label + short reason. Full-width `PrimaryButton`. Padding `--space-5`. Do not compete with oversized decoration.

## 7. TrainingCard

Teal graduation icon + training label. Title from `trainingTopic`. Short supporting line. `SecondaryButton` for start training. Optional simple illustration; skip if it adds visual noise. Follow-up to the recommendation, not a second primary CTA.

## 8. Badge / Chip

Pill (`--radius-full`), label-scale type. Variants: `primary`, `positive`, `warning`, `neutral`. Use for coach badge, trend, mentions, impact. Height compact; not a button.

## 9. PrimaryButton

Height ~48px, `--radius-md`, solid `--color-primary`, white text. Hover: `--color-primary-hover`. Visible focus ring. Full width only inside `AIRecommendationCard`. Do not oversize.

## 10. SecondaryButton

Outlined: `--color-border` (or muted primary), surface fill, navy text. Same height/radius family as primary. Used on `TrainingCard` and error retry. Hover: slight border/background darken. Focus ring required.

---

## States

Loading, error, and empty stay on-token: same page background, same header, one surface card. Error retry uses `SecondaryButton`. Do not introduce a separate admin theme for states.
