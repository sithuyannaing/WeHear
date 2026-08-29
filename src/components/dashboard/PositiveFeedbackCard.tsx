import type { CustomerInsight } from "../../lib/types";
import card from "./card.module.css";
import styles from "./PositiveFeedbackCard.module.css";

interface PositiveFeedbackCardProps {
  insight: CustomerInsight;
}

export default function PositiveFeedbackCard({ insight }: PositiveFeedbackCardProps) {
  return (
    <section className={`${card.card} ${styles.card}`}>
      <div className={styles.eyebrow}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-6.5-4.2-9.2-8.1C1 10.7 1.4 7.2 4 5.6c2.1-1.3 4.6-.6 6 1.3C11.4 5 13.9 4.3 16 5.6c2.6 1.6 3 5.1 1.2 7.3C18.5 16.8 12 21 12 21z" />
        </svg>
        Customers love
      </div>
      <p className={styles.quote}>“{insight.label}”</p>
      <p className={styles.footer}>
        Mentioned {insight.count} time{insight.count === 1 ? "" : "s"}
      </p>
    </section>
  );
}
