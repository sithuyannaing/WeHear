import styles from "./DashboardHeader.module.css";

interface DashboardHeaderProps {
  greeting: string;
  businessName: string;
  updatedAt?: Date;
}

function formatUpdated(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardHeader({ greeting, businessName, updatedAt }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <h1 className={styles.title}>{greeting}</h1>
        <p className={styles.subtitle}>Here is how customers experienced your business today.</p>
      </div>
      <div className={styles.meta}>
        <span className={styles.pill}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
          </svg>
          {businessName}
        </span>
        {updatedAt && (
          <span className={styles.updated}>Updated {formatUpdated(updatedAt)}</span>
        )}
      </div>
    </header>
  );
}
