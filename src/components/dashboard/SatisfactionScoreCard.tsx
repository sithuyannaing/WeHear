import { useEffect, useState } from "react";
import Chip from "./Chip";
import card from "./card.module.css";
import styles from "./SatisfactionScoreCard.module.css";

interface SatisfactionScoreCardProps {
  satisfactionScore: number;
  feedbackCount: number;
  averageRating: number;
}

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useCountUp(target: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const duration = 600;
    const from = 0;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(from + (target - from) * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

function trendLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Steady";
  return "Needs work";
}

export default function SatisfactionScoreCard({
  satisfactionScore,
  feedbackCount,
  averageRating,
}: SatisfactionScoreCardProps) {
  const display = useCountUp(satisfactionScore);
  const percent = Math.min(100, Math.max(0, satisfactionScore));
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <section className={`${card.card} ${styles.card}`}>
      <p className={styles.label}>Satisfaction score</p>
      <div className={styles.ringWrap} aria-hidden="true">
        <svg className={styles.ring} viewBox="0 0 88 88">
          <defs>
            <linearGradient id="scoreStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-positive)" />
            </linearGradient>
          </defs>
          <circle
            cx="44"
            cy="44"
            r={RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          <circle
            cx="44"
            cy="44"
            r={RADIUS}
            fill="none"
            stroke="url(#scoreStroke)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
      </div>
      <div className={styles.scoreBlock}>
        <div className={styles.kpiRow}>
          <span className={styles.kpi}>{display}</span>
          <span className={styles.max}>/100</span>
        </div>
      </div>
      <div className={styles.side}>
        <Chip variant="positive">{trendLabel(satisfactionScore)}</Chip>
        <p className={styles.sample}>
          {feedbackCount} response{feedbackCount === 1 ? "" : "s"} · {averageRating.toFixed(1)} avg rating
        </p>
      </div>
    </section>
  );
}
