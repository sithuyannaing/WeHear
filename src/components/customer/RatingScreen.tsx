import type { Rating } from "../../lib/types";
import screen from "./screen.module.css";
import styles from "./RatingScreen.module.css";

const OPTIONS: { value: Rating; emoji: string }[] = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
];

interface RatingScreenProps {
  onNext: (rating: Rating) => void;
}

export default function RatingScreen({ onNext }: RatingScreenProps) {
  return (
    <section className={screen.screen}>
      <div className={screen.content}>
        <header className={screen.header}>
          <h1 className={screen.title}>How did we do today?</h1>
          <p className={screen.subtitle}>This takes about 10 seconds.</p>
        </header>
        <div className={styles.row} role="radiogroup" aria-label="Rating">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={styles.option}
              onClick={() => onNext(opt.value)}
              aria-label={`Rate ${opt.value} out of 5`}
            >
              <span className={styles.emoji} aria-hidden="true">
                {opt.emoji}
              </span>
              <span className={styles.number}>{opt.value}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
