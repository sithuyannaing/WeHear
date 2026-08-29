import screen from "./screen.module.css";
import styles from "./ThankYouScreen.module.css";

export default function ThankYouScreen() {
  return (
    <section className={screen.screen}>
      <div className={screen.content}>
        <header className={screen.header}>
          <div className={styles.check} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className={screen.title}>Thank you!</h1>
        </header>
        <p className={styles.message}>
          Your feedback has been recorded. We appreciate you taking the time.
        </p>
      </div>
    </section>
  );
}
