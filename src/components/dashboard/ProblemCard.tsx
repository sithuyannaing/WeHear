import type { TopProblemData } from "../../lib/types";
import Chip from "./Chip";
import card from "./card.module.css";
import styles from "./ProblemCard.module.css";

interface ProblemCardProps {
  problem: TopProblemData;
}

const IMPACT: Record<string, string> = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
};

export default function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <section className={`${card.card} ${styles.card}`}>
      <div className={styles.eyebrow}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 9v4" strokeLinecap="round" />
          <path d="M12 17h.01" strokeLinecap="round" />
          <path d="M10.3 4.3L2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
        </svg>
        Top problem
      </div>
      <h2 className={styles.title}>{problem.title}</h2>
      <div className={styles.footer}>
        <Chip variant="neutral">{problem.mentionCount} mentions</Chip>
        <Chip variant="warning">{IMPACT[problem.priority] ?? problem.priority}</Chip>
      </div>
    </section>
  );
}
