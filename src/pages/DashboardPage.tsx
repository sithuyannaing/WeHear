import { useEffect, useState } from "react";
import SatisfactionScore from "../components/SatisfactionScore";
import InsightsList from "../components/InsightsList";
import TopProblem from "../components/TopProblem";
import RecommendedAction from "../components/RecommendedAction";
import MicroCoaching from "../components/MicroCoaching";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import RecentFeedbacks from "../components/RecentFeedbacks";
import type { OwnerDashboardData } from "../lib/types";

type LoadState = "loading" | "success" | "error";

export default function DashboardPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/owner-dashboard?businessId=${encodeURIComponent(import.meta.env.VITE_DEMO_BUSINESS_ID)}`
        );
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to load dashboard");
        }

        if (!cancelled) {
          setData(result.dashboard);
          setState("success");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
          setState("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="dashboard-page">
        <LoadingState />
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="dashboard-page">
        <div className="dash-error">
          <p className="error-message" role="alert">{errorMessage || "Unable to load dashboard."}</p>
        </div>
      </div>
    );
  }

  if (data.feedbackCount === 0) {
    return (
      <div className="dashboard-page">
        <div className="dash-card">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dash-grid">
        <SatisfactionScore
          satisfactionScore={data.satisfactionScore}
          averageRating={data.averageRating}
          feedbackCount={data.feedbackCount}
        />

        <InsightsList
          positiveInsights={data.positiveInsights}
          negativeInsights={data.negativeInsights}
          sentimentDistribution={data.sentimentDistribution}
          totalFeedbacks={data.feedbackCount}
        />

        {data.topProblem && <TopProblem problem={data.topProblem} />}

        {data.recommendedAction && (
          <RecommendedAction action={data.recommendedAction} />
        )}

        {data.microCoaching && <MicroCoaching coaching={data.microCoaching} topProblem={data.topProblem} />}

        <RecentFeedbacks items={data.recentFeedbacks} />
      </div>
    </div>
  );
}