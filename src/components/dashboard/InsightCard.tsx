import Chip from "./Chip";
import card from "./card.module.css";
import styles from "./InsightCard.module.css";

interface InsightCardProps {
  summary: string;
}

export default function InsightCard({ summary }: InsightCardProps) {
  return (
    <section className={`${card.card} ${styles.card}`}>
      <Chip variant="primary">Here's what I found</Chip>
      <p className={styles.body}>{summary}</p>
    </section>
  );
}
