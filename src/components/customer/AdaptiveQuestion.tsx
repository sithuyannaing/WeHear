import { MAX_COMMENT_CHARS, WARN_COMMENT_CHARS } from "../../constants";
import screen from "./screen.module.css";
import styles from "./AdaptiveQuestion.module.css";

interface AdaptiveQuestionProps {
  question: string;
  apology?: string;
  comment: string;
  onCommentChange: (value: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
  errorMessage?: string;
}

export default function AdaptiveQuestion({
  question,
  apology,
  comment,
  onCommentChange,
  onContinue,
  onSkip,
  isSubmitting,
  errorMessage,
}: AdaptiveQuestionProps) {
  const canContinue = comment.trim().length > 0 && !isSubmitting;
  const nearLimit = comment.length >= WARN_COMMENT_CHARS;

  return (
    <section className={screen.screen}>
      <div className={screen.content}>
        <header className={screen.header}>
          {apology && <p className={styles.apology}>{apology}</p>}
          <h1 className={screen.title}>{question}</h1>
        </header>

        <div className={styles.field}>
          <textarea
            className={styles.textarea}
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            maxLength={MAX_COMMENT_CHARS}
            placeholder="Optional — tell us more"
            aria-label="Optional comment"
            disabled={isSubmitting}
          />
          <span
            className={`${styles.counter} ${nearLimit ? styles.counterWarn : ""}`}
          >
            {comment.length}/{MAX_COMMENT_CHARS}
          </span>
        </div>

        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={onContinue}
            disabled={!canContinue}
          >
            {isSubmitting ? "Sending..." : "Continue"}
          </button>
          <button
            type="button"
            className={styles.skip}
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Skip
          </button>
        </div>
      </div>
    </section>
  );
}
