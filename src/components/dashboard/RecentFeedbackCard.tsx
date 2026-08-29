import type { RecentFeedbackItem } from "../../lib/types";
import Chip from "./Chip";
import card from "./card.module.css";
import styles from "./RecentFeedbackCard.module.css";

interface RecentFeedbackCardProps {
  items: RecentFeedbackItem[];
}

function sentimentVariant(sentiment: string | null): "positive" | "warning" | "neutral" {
  if (sentiment === "positive") return "positive";
  if (sentiment === "negative") return "warning";
  return "neutral";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RecentFeedbackCard({ items }: RecentFeedbackCardProps) {
  if (items.length === 0) return null;

  return (
    <section className={`${card.card} ${styles.card}`}>
      <h2 className={styles.title}>Recent feedback</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.head}>
              <span className={styles.rating}>{item.rating}/5</span>
              {item.sentiment && (
                <Chip variant={sentimentVariant(item.sentiment)}>{item.sentiment}</Chip>
              )}
              {item.createdAt && <span className={styles.date}>{formatDate(item.createdAt)}</span>}
            </div>
            {item.summary && <p className={styles.summary}>{item.summary}</p>}
            {item.comment && <p className={styles.comment}>“{item.comment}”</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
