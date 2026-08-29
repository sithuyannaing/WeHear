import type { OwnerDashboardData } from "./types";

const now = () => new Date().toISOString();

export const DUMMY_DASHBOARD: OwnerDashboardData = {
  satisfactionScore: 82,
  averageRating: 4.1,
  feedbackCount: 24,
  sentimentDistribution: { positive: 16, neutral: 5, negative: 3 },
  positiveInsights: [
    { label: "Friendly staff", count: 9 },
    { label: "Clean space", count: 6 },
  ],
  negativeInsights: [
    { label: "Wait time", count: 5 },
    { label: "Busy hours", count: 3 },
  ],
  topProblem: {
    id: "waiting_time",
    title: "Waiting Time",
    mentionCount: 5,
    priority: "high",
    explanation: "Customers mention long waits during peak hours.",
    evidence: [
      "Waited 20 minutes before anyone took my order.",
      "Line moved slowly at lunch.",
    ],
  },
  recommendedAction: {
    title: "Greet waiting guests within 60 seconds",
    reason: "Peak-hour waits are the top complaint. A fast acknowledgment cuts frustration even when the queue is long.",
    expectedGoal: "Fewer wait-time mentions in the next 20 responses.",
  },
  microCoaching: {
    title: "Fast Customer Service",
    durationMinutes: 5,
    basedOnProblemId: "waiting_time",
  },
  recentFeedbacks: [
    {
      id: "demo-1",
      rating: 5,
      comment: "Staff were welcoming and the place was clean.",
      sentiment: "positive",
      summary: "Praised staff and environment.",
      createdAt: now(),
    },
    {
      id: "demo-2",
      rating: 2,
      comment: "Too long to get seated at lunch.",
      sentiment: "negative",
      summary: "Frustrated by wait time.",
      createdAt: now(),
    },
    {
      id: "demo-3",
      rating: 4,
      comment: "Good food, a bit slow.",
      sentiment: "neutral",
      summary: "Liked the product, noted delay.",
      createdAt: now(),
    },
  ],
};

export function dummyDashboardResponse() {
  return {
    success: true as const,
    demo: true as const,
    dashboard: DUMMY_DASHBOARD,
  };
}
