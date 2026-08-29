import type { TopicOption } from "../../types";
import screen from "./screen.module.css";
import styles from "./TopicScreen.module.css";

interface TopicScreenProps {
  topics: TopicOption[];
  selectedId?: TopicOption["id"] | null;
  onNext: (topicId: TopicOption["id"]) => void;
}

export default function TopicScreen({ topics, selectedId, onNext }: TopicScreenProps) {
  return (
    <section className={screen.screen}>
      <div className={screen.content}>
        <header className={screen.header}>
          <h1 className={screen.title}>What would you like to tell us about?</h1>
        </header>
        <div className={styles.grid}>
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className={styles.tile}
              data-selected={selectedId === topic.id ? "true" : undefined}
              onClick={() => onNext(topic.id)}
            >
              <span className={styles.icon} aria-hidden="true">
                {topic.icon}
              </span>
              <span className={styles.label}>{topic.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
