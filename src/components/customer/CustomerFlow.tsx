import { useRef, useState } from "react";
import type { FeedbackCategory, Rating } from "../../lib/types";
import type { FeedbackData, Screen, TopicOption } from "../../types";
import AdaptiveQuestion from "./AdaptiveQuestion";
import RatingScreen from "./RatingScreen";
import ThankYouScreen from "./ThankYouScreen";
import TopicScreen from "./TopicScreen";
import styles from "./CustomerFlow.module.css";

const TOPICS: TopicOption[] = [
  { id: "product", label: "Product", icon: "📦" },
  { id: "service", label: "Service", icon: "🛎️" },
  { id: "staff", label: "Staff", icon: "👤" },
  { id: "waiting_time", label: "Waiting Time", icon: "⏱️" },
  { id: "price", label: "Price", icon: "💰" },
  { id: "environment", label: "Environment", icon: "🌿" },
  { id: "other", label: "Other", icon: "💬" },
];

function getAdaptiveCopy(rating: Rating): { question: string; apology?: string } {
  if (rating <= 2) {
    return {
      question: "What could we improve?",
      apology: "We're sorry your visit wasn't great.",
    };
  }
  if (rating === 3) {
    return { question: "How could we make your next experience better?" };
  }
  return { question: "What did you like most?" };
}

export default function CustomerFlow() {
  const [screen, setScreen] = useState<Screen>("rating");
  const [data, setData] = useState<FeedbackData>({
    rating: null,
    topic: null,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submittingRef = useRef(false);

  function handleRating(rating: Rating) {
    setData((prev) => ({ ...prev, rating }));
    setScreen("topic");
  }

  function handleTopic(topic: FeedbackCategory) {
    setData((prev) => ({ ...prev, topic }));
    setScreen("adaptive");
  }

  async function submitFeedback(commentOverride?: string) {
    if (!data.rating || !data.topic || submittingRef.current) return;

    const comment = (commentOverride ?? data.comment).trim();

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: import.meta.env.VITE_DEMO_BUSINESS_ID,
          rating: data.rating,
          categories: [data.topic],
          comment: comment || undefined,
          source: "web",
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to submit feedback");
      }

      setScreen("thankYou");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleContinue() {
    void submitFeedback();
  }

  function handleSkip() {
    setData((prev) => ({ ...prev, comment: "" }));
    void submitFeedback("");
  }

  const adaptive =
    data.rating !== null ? getAdaptiveCopy(data.rating) : { question: "" };

  return (
    <div className={styles.flow}>
      {screen === "rating" && <RatingScreen onNext={handleRating} />}
      {screen === "topic" && (
        <TopicScreen topics={TOPICS} selectedId={data.topic} onNext={handleTopic} />
      )}
      {screen === "adaptive" && (
        <AdaptiveQuestion
          question={adaptive.question}
          apology={adaptive.apology}
          comment={data.comment}
          onCommentChange={(comment) => setData((prev) => ({ ...prev, comment }))}
          onContinue={handleContinue}
          onSkip={handleSkip}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      )}
      {screen === "thankYou" && <ThankYouScreen />}
    </div>
  );
}
