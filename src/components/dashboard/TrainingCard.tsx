import type { MicroCoachingData } from "../../lib/types";
import SecondaryButton from "./SecondaryButton";
import card from "./card.module.css";
import styles from "./TrainingCard.module.css";

interface TrainingCardProps {
  coaching: MicroCoachingData;
  onStart: () => void;
  sendStatus: "idle" | "sending" | "success" | "error";
  sendError?: string;
}

export default function TrainingCard({
  coaching,
  onStart,
  sendStatus,
  sendError,
}: TrainingCardProps) {
  const label =
    sendStatus === "sending"
      ? "Sending..."
      : sendStatus === "success"
        ? "Training sent"
        : "Start training";

  return (
    <section className={`${card.card} ${styles.card}`}>
      <div className={styles.eyebrow}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M22 10L12 5 2 10l10 5 10-5z" strokeLinejoin="round" />
          <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" strokeLinecap="round" />
        </svg>
        Training
      </div>
      <h2 className={styles.title}>{coaching.title}</h2>
      <p className={styles.support}>{coaching.durationMinutes}-minute practice for your team.</p>
      <SecondaryButton fullWidth onClick={onStart} loading={sendStatus === "sending"}>
        {label}
      </SecondaryButton>
      {sendStatus === "error" && sendError && (
        <p className={styles.error} role="alert">
          {sendError}
        </p>
      )}
    </section>
  );
}
