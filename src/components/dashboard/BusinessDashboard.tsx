import { useRef, useState } from "react";
import type { OwnerDashboardData } from "../../lib/types";
import AIRecommendationCard from "./AIRecommendationCard";
import DashboardHeader from "./DashboardHeader";
import InsightCard from "./InsightCard";
import PositiveFeedbackCard from "./PositiveFeedbackCard";
import ProblemCard from "./ProblemCard";
import RecentFeedbackCard from "./RecentFeedbackCard";
import SatisfactionScoreCard from "./SatisfactionScoreCard";
import SecondaryButton from "./SecondaryButton";
import TrainingCard from "./TrainingCard";
import card from "./card.module.css";
import styles from "./BusinessDashboard.module.css";

type LoadState = "loading" | "success" | "error" | "empty";
type SendStatus = "idle" | "sending" | "success" | "error";

interface BusinessDashboardProps {
  state: LoadState;
  data: OwnerDashboardData | null;
  errorMessage: string;
  updatedAt?: Date;
  onRetry: () => void;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function buildInsightSummary(data: OwnerDashboardData): string {
  const { feedbackCount, sentimentDistribution, positiveInsights, negativeInsights } = data;
  const love = positiveInsights[0]?.label;
  const issue = negativeInsights[0]?.label;
  const parts = [
    `Across ${feedbackCount} response${feedbackCount === 1 ? "" : "s"}, ${sentimentDistribution.positive} were positive, ${sentimentDistribution.neutral} neutral, and ${sentimentDistribution.negative} negative.`,
  ];
  if (love) parts.push(`Customers mention ${love} most.`);
  if (issue) parts.push(`${issue} needs the most attention.`);
  return parts.join(" ");
}

export default function BusinessDashboard({
  state,
  data,
  errorMessage,
  updatedAt,
  onRetry,
}: BusinessDashboardProps) {
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [sendError, setSendError] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSend(trainingId: string) {
    if (sendStatus === "sending") return;

    setSendStatus("sending");
    setSendError("");

    try {
      const res = await fetch("/api/send-coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: import.meta.env.VITE_DEMO_BUSINESS_ID,
          trainingId,
          staffId: "demo-staff",
          channel: "telegram",
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Coaching could not be sent.");
      }

      setSendStatus("success");
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setSendStatus("idle"), 3000);
    } catch (err) {
      setSendStatus("error");
      setSendError(err instanceof Error ? err.message : "Coaching could not be sent.");
    }
  }

  const hello = greeting();
  const header = (
    <DashboardHeader
      greeting={hello}
      businessName="Sunrise Cafe"
      updatedAt={state === "success" ? updatedAt : undefined}
    />
  );

  if (state === "loading") {
    return (
      <div className={styles.page}>
        {header}
        <div className={`${styles.skeletonCard} ${styles.shimmer}`}>
          <div className={`${styles.line} ${styles.lineShort}`} />
          <div className={`${styles.line} ${styles.lineMed}`} />
        </div>
        <div className={`${styles.skeletonCard} ${styles.shimmer}`}>
          <div className={`${styles.line} ${styles.lineMed}`} />
          <div className={styles.line} />
        </div>
        <div className={styles.pair}>
          <div className={`${styles.skeletonCard} ${styles.shimmer}`}>
            <div className={`${styles.line} ${styles.lineShort}`} />
            <div className={styles.line} />
          </div>
          <div className={`${styles.skeletonCard} ${styles.shimmer}`}>
            <div className={`${styles.line} ${styles.lineShort}`} />
            <div className={styles.line} />
          </div>
        </div>
        <div className={`${styles.skeletonCard} ${styles.skeletonFeature} ${styles.shimmer}`}>
          <div className={`${styles.line} ${styles.lineShort}`} />
          <div className={styles.line} />
          <div className={`${styles.line} ${styles.lineMed}`} />
        </div>
        <div className={`${styles.skeletonCard} ${styles.shimmer}`}>
          <div className={`${styles.line} ${styles.lineMed}`} />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={styles.page}>
        {header}
        <section className={`${card.card} ${styles.stateCard}`}>
          <h2 className={styles.stateTitle}>Unable to load dashboard</h2>
          <p className={styles.stateBody} role="alert">
            {errorMessage || "Something went wrong."}
          </p>
          <SecondaryButton onClick={onRetry}>Try again</SecondaryButton>
        </section>
      </div>
    );
  }

  if (state === "empty" || !data) {
    return (
      <div className={styles.page}>
        {header}
        <section className={`${card.card} ${styles.stateCard}`}>
          <h2 className={styles.stateTitle}>No feedback yet</h2>
          <p className={styles.stateBody}>
            Once customers submit feedback, your satisfaction score, insights, and recommendations will appear here.
          </p>
        </section>
      </div>
    );
  }

  const topPositive = data.positiveInsights[0];
  const coaching = data.microCoaching;

  return (
    <div className={styles.page}>
      <DashboardHeader greeting={hello} businessName="Demo business" updatedAt={updatedAt} />
      <SatisfactionScoreCard
        satisfactionScore={data.satisfactionScore}
        feedbackCount={data.feedbackCount}
        averageRating={data.averageRating}
      />
      <InsightCard summary={buildInsightSummary(data)} />
      {(data.topProblem || topPositive) && (
        <div className={styles.pair}>
          {data.topProblem && <ProblemCard problem={data.topProblem} />}
          {topPositive && <PositiveFeedbackCard insight={topPositive} />}
        </div>
      )}
      {data.recommendedAction && (
        <AIRecommendationCard
          action={data.recommendedAction}
          onSend={coaching ? () => handleSend(coaching.basedOnProblemId) : undefined}
          sendStatus={sendStatus}
          sendError={sendError}
        />
      )}
      {coaching && (
        <TrainingCard
          coaching={coaching}
          onStart={() => handleSend(coaching.basedOnProblemId)}
          sendStatus={sendStatus}
          sendError={sendError}
        />
      )}
      <RecentFeedbackCard items={data.recentFeedbacks} />
    </div>
  );
}
