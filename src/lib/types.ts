import z from "zod";

export const FEEDBACK_CATEGORIES = [
  "product",
  "service",
  "staff",
  "waiting_time",
  "price",
  "environment",
  "other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export type Rating = 1 | 2 | 3 | 4 | 5;

export type FeedbackSource = "qr" | "web";

export const SENTIMENTS = ["positive", "neutral", "negative"] as const;

export type Sentiment = (typeof SENTIMENTS)[number];

export const URGENCIES = ["low", "medium", "high"] as const;

export type Urgency = (typeof URGENCIES)[number];

export interface FeedbackRequest {
  businessId: string;
  rating: Rating;
  categories: FeedbackCategory[];
  comment?: string;
  source?: FeedbackSource;
}

export interface FeedbackSuccessResponse {
  success: true;
  feedbackId: string;
}

export interface FeedbackErrorResponse {
  success: false;
  error: string;
}

export interface FeedbackAnalysis {
  id: string;
  feedbackId: string;
  sentiment: Sentiment;
  sentimentScore: number;
  topics: string[];
  summary: string;
  positiveSignals: string[];
  negativeSignals: string[];
  urgency: Urgency;
  model: string | null;
  analyzedAt: Date;
  createdAt: Date;
}

export const aiAnalysisSchema = z.object({
  sentiment: z.enum(SENTIMENTS),
  sentimentScore: z.number().min(0).max(1),
  topics: z.array(z.string().max(50)).max(10),
  summary: z.string().min(1).max(300),
  positiveSignals: z.array(z.string().max(100)).max(10),
  negativeSignals: z.array(z.string().max(100)).max(10),
  urgency: z.enum(URGENCIES),
});

export function repairAnalysisOutput(parsed: unknown): unknown {
  const record = (parsed ?? {}) as Record<string, unknown>;
  const score = typeof record.sentimentScore === "number" ? record.sentimentScore : Number.NaN;
  if (!Number.isNaN(score)) {
    record.sentimentScore = Math.min(1, Math.max(0, Math.round(score * 100) / 100));
  }
  return record;
}

export const recommendationSchema = z.object({
  title: z.string().min(1).max(200),
  reason: z.string().min(1).max(300),
  expectedGoal: z.string().min(1).max(300),
});

export type Recommendation = z.infer<typeof recommendationSchema>;

export const PRIORITIES = ["low", "medium", "high"] as const;

export type Priority = (typeof PRIORITIES)[number];

export interface CustomerInsight {
  label: string;
  count: number;
}

export interface TopProblemData {
  id: string;
  title: string;
  mentionCount: number;
  priority: Priority;
  explanation: string;
  evidence: string[];
}

export interface RecommendedActionData {
  title: string;
  reason: string;
  expectedGoal: string;
}

export interface MicroCoachingData {
  title: string;
  durationMinutes: number;
  basedOnProblemId: string;
}

export interface RecentFeedbackItem {
  id: string;
  rating: number;
  comment: string | null;
  sentiment: string | null;
  summary: string | null;
  createdAt: string;
}

export interface OwnerDashboardData {
  satisfactionScore: number;
  averageRating: number;
  feedbackCount: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  positiveInsights: CustomerInsight[];
  negativeInsights: CustomerInsight[];
  topProblem: TopProblemData | null;
  recommendedAction: RecommendedActionData | null;
  microCoaching: MicroCoachingData | null;
  recentFeedbacks: RecentFeedbackItem[];
}

export const COACHING_CHANNELS = ["telegram", "email", "viber"] as const;

export type CoachingChannel = (typeof COACHING_CHANNELS)[number];

export const DELIVERY_STATUSES = ["pending", "sent", "failed"] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const sendCoachingRequestSchema = z.object({
  businessId: z.string().min(1),
  trainingId: z.enum(FEEDBACK_CATEGORIES),
  staffId: z.string().min(1).max(100),
  channel: z.enum(COACHING_CHANNELS),
});

export type SendCoachingRequest = z.infer<typeof sendCoachingRequestSchema>;

export interface CoachingDelivery {
  id: string;
  businessId: string;
  problemId: string;
  trainingTitle: string;
  staffId: string;
  channel: CoachingChannel;
  recipient: string | null;
  status: DeliveryStatus;
  sentAt: Date | null;
  createdAt: Date;
}