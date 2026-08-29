import type { RecommendedActionData } from "../../lib/types";
import Chip from "./Chip";
import PrimaryButton from "./PrimaryButton";
import card from "./card.module.css";
import styles from "./AIRecommendationCard.module.css";

interface AIRecommendationCardProps {
  action: RecommendedActionData;
  onSend?: () => void;
  sendStatus?: "idle" | "sending" | "success" | "error";
  sendError?: string;
}

export default function AIRecommendationCard({
  action,
  onSend,
  sendStatus = "idle",
  sendError,
}: AIRecommendationCardProps) {
  const label =
    sendStatus === "sending"
      ? "Sending..."
      : sendStatus === "success"
        ? "Sent to staff"
        : "Send to staff";

  return (
    <section className={`${card.card} ${card.cardFeature} ${styles.card}`}>
      <Chip variant="primary">Coach</Chip>
      <p className={styles.subtitle}>Next best action</p>
      <h2 className={styles.title}>{action.title}</h2>
      <div className={styles.why}>
        <span className={styles.whyLabel}>Why this matters</span>
        <p className={styles.whyText}>{action.reason}</p>
      </div>
      {action.expectedGoal && <p className={styles.goal}>{action.expectedGoal}</p>}
      {onSend && (
        <PrimaryButton fullWidth onClick={onSend} loading={sendStatus === "sending"}>
          {label}
        </PrimaryButton>
      )}
      {sendStatus === "error" && sendError && (
        <p className={styles.error} role="alert">
          {sendError}
        </p>
      )}
    </section>
  );
}
