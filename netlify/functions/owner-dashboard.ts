import { eq, desc } from "drizzle-orm";
import { OpenAI } from "openai";
import { getDb } from "../../src/db/index.js";
import { dummyDashboardResponse } from "../../src/lib/dummyDashboard.js";
import { feedbacks, feedbackAnalyses } from "../../src/db/schema.js";
import type {
  FeedbackCategory,
  Sentiment,
  Urgency,
  Priority,
  CustomerInsight,
  RecommendedActionData,
} from "../../src/lib/types.js";
import { aiAnalysisSchema, recommendationSchema, repairAnalysisOutput } from "../../src/lib/types.js";
import { buildAnalyzeFeedbackPrompt } from "./prompts/analyze-feedback.js";
import { buildRecommendationPrompt } from "./prompts/generate-recommendation.js";

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  product: "Product",
  service: "Service",
  staff: "Staff",
  waiting_time: "Waiting Time",
  price: "Price",
  environment: "Environment",
  other: "Other",
};

const RECOMMENDATION_TEMPLATES: Record<FeedbackCategory, RecommendedActionData> = {
  product: {
    title: "Hold a short product-quality sprint with your team this week.",
    reason: "Product quality is the most frequently cited service problem in recent feedback.",
    expectedGoal: "Reduce product-related complaints.",
  },
  service: {
    title: "Walk your service process end-to-end and remove one bottleneck you find.",
    reason: "Service process is the top reported problem from recent customers.",
    expectedGoal: "Reduce service-related complaints.",
  },
  staff: {
    title: "Run a short team huddle focused on one customer-interaction skill.",
    reason: "Staff interactions are flagged as the most common problem in recent feedback.",
    expectedGoal: "Reduce staff-related complaints.",
  },
  waiting_time: {
    title: "Assign one extra staff member to checkout during peak hours.",
    reason: "Waiting time is the most frequently reported service problem.",
    expectedGoal: "Reduce waiting-time complaints.",
  },
  price: {
    title: "Review pricing against perceived value and add a clearly explained option.",
    reason: "Price is the most frequently reported concern in recent feedback.",
    expectedGoal: "Reduce price-related complaints.",
  },
  environment: {
    title: "Make three quick improvements to the physical space this week (lighting, seating, or cleanliness).",
    reason: "The environment is the most frequently cited problem in recent feedback.",
    expectedGoal: "Reduce environment-related complaints.",
  },
  other: {
    title: "Add a follow-up question asking what, specifically, went wrong.",
    reason: "General complaints are the most frequent signal and need more detail to act on.",
    expectedGoal: "Surface the root causes behind general complaints.",
  },
};

const MICRO_COACHING_TITLES: Record<FeedbackCategory, string> = {
  product: "Product-Quality Essentials",
  service: "Service Recovery",
  staff: "Friendly Customer Service",
  waiting_time: "Fast Customer Service",
  price: "Value Messaging",
  environment: "Clean & Inviting Space",
  other: "Active Listening",
};

interface DashboardFeedback {
  id: string;
  rating: number;
  categories: string[];
  comment: string | null;
  createdAt: Date;
  sentiment: Sentiment | null;
  sentimentScore: number | null;
  summary: string | null;
  urgency: Urgency | null;
  positiveSignals: string[] | null;
  negativeSignals: string[] | null;
}

interface DashboardTopProblem {
  id: string;
  title: string;
  mentionCount: number;
  priority: Priority;
  explanation: string;
  evidence: string[];
}

interface DashboardComputation {
  satisfactionScore: number;
  averageRating: number;
  feedbackCount: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  positiveInsights: CustomerInsight[];
  negativeInsights: CustomerInsight[];
  topProblem: DashboardTopProblem | null;
  recommendedAction: RecommendedActionData | null;
  microCoaching: { title: string; durationMinutes: number; basedOnProblemId: string } | null;
  recentFeedbacks: Array<{
    id: string;
    rating: number;
    comment: string | null;
    sentiment: Sentiment | null;
    summary: string | null;
    createdAt: Date;
  }>;
}

const MAX_ANALYSES_PER_REQUEST = 5;
const EVIDENCE_SNIPPET_MAX = 80;

function validateWithFallbackSummary(
  parsed: unknown,
  rating: number
): ReturnType<typeof aiAnalysisSchema.parse> | null {
  const recovered = {
    ...(parsed as Record<string, unknown>),
    summary: `Customer rated their experience ${rating}/5 with no additional comment.`,
  };
  const result = aiAnalysisSchema.safeParse(recovered);
  if (!result.success) {
    console.warn("Analysis: validation failed for fallback", JSON.stringify(result.error.format()));
    return null;
  }
  return result.data;
}

async function analyzeOneFeedback(
  feedback: { id: string; rating: number; categories: string[]; comment: string | null },
  openai: OpenAI,
  db: ReturnType<typeof getDb>
): Promise<void> {
  console.log("Analysis: attempting for", feedback.id, "rating", feedback.rating, "comment", feedback.comment);
  const prompt = buildAnalyzeFeedbackPrompt(
    feedback.rating,
    feedback.categories as FeedbackCategory[],
    feedback.comment ?? null
  );

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const aiResponse = completion.choices[0].message.content;
  if (typeof aiResponse !== "string") {
    console.warn("Analysis: non-string AI response for", feedback.id);
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(aiResponse);
  } catch {
    console.warn("Analysis: JSON parse failed for", feedback.id, aiResponse.slice(0, 200));
    return;
  }

  const repaired = repairAnalysisOutput(parsed);
  const validation = aiAnalysisSchema.safeParse(repaired);
  if (!validation.success) {
    const nonSummaryIssues = validation.error.issues.filter(
      (i) => !(i.path[0] === "summary" && i.code === "too_small")
    );
    if (nonSummaryIssues.length > 0) {
      console.warn("Analysis: validation failed for", feedback.id, JSON.stringify(validation.error.format()));
      return;
    }
  }

  const data =
    validation.success && validation.data.summary
      ? validation.data
      : validateWithFallbackSummary(repaired, feedback.rating);

  if (!data) return;

  await db
    .insert(feedbackAnalyses)
    .values({
      feedbackId: feedback.id,
      sentiment: data.sentiment,
      sentimentScore: data.sentimentScore,
      topics: data.topics,
      summary: data.summary,
      positiveSignals: data.positiveSignals,
      negativeSignals: data.negativeSignals,
      urgency: data.urgency,
      model: "openai/gpt-oss-20b",
    })
    .onConflictDoUpdate({
      target: feedbackAnalyses.feedbackId,
      set: {
        sentiment: data.sentiment,
        sentimentScore: data.sentimentScore,
        topics: data.topics,
        summary: data.summary,
        positiveSignals: data.positiveSignals,
        negativeSignals: data.negativeSignals,
        urgency: data.urgency,
        model: "openai/gpt-oss-20b",
        analyzedAt: new Date(),
      },
    });
}

function aggregateInsights(signals: (string[] | null)[]): CustomerInsight[] {
  const counts = new Map<string, number>();
  for (const list of signals) {
    if (!list) continue;
    for (const signal of list) {
      const key = signal.trim();
      if (key.length === 0) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }));
}

function truncateSnippet(comment: string): string {
  const cleaned = comment.trim().replace(/\s+/g, " ");
  if (cleaned.length <= EVIDENCE_SNIPPET_MAX) return cleaned;
  return `${cleaned.slice(0, EVIDENCE_SNIPPET_MAX - 1)}…`;
}

function computePriority(params: {
  mentionCount: number;
  totalFeedbackCount: number;
  negativeMentionCount: number;
  urgentMentionCount: number;
}): Priority {
  const { mentionCount, totalFeedbackCount, negativeMentionCount, urgentMentionCount } = params;
  const ratio = mentionCount / Math.max(1, totalFeedbackCount);

  let level = 0;
  if (ratio >= 0.25) level += 2;
  else if (ratio >= 0.12) level += 1;
  if (negativeMentionCount > 0) level += 1;
  if (urgentMentionCount > 0) level += 1;

  if (level >= 3) return "high";
  if (level >= 2) return "medium";
  return "low";
}

function computeDashboard(feedbackRows: DashboardFeedback[]): DashboardComputation {
  if (feedbackRows.length === 0) {
    return {
      satisfactionScore: 0,
      averageRating: 0,
      feedbackCount: 0,
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      positiveInsights: [],
      negativeInsights: [],
      topProblem: null,
      recommendedAction: null,
      microCoaching: null,
      recentFeedbacks: [],
    };
  }

  const totalFeedbacks = feedbackRows.length;
  const averageRating =
    Math.round((feedbackRows.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks) * 10) / 10;
  const satisfactionScore = Math.round((averageRating / 5) * 100);

  const sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };
  for (const f of feedbackRows) {
    if (f.sentiment) {
      sentimentDistribution[f.sentiment]++;
    }
  }

  const positiveInsights = aggregateInsights(feedbackRows.map((f) => f.positiveSignals));
  const negativeInsights = aggregateInsights(feedbackRows.map((f) => f.negativeSignals));

  const negativeFeedbacks = feedbackRows.filter((f) => f.sentiment === "negative" || f.rating <= 2);

  const negativeCategoryCounts = new Map<string, number>();
  for (const f of negativeFeedbacks) {
    for (const cat of f.categories) {
      negativeCategoryCounts.set(cat, (negativeCategoryCounts.get(cat) ?? 0) + 1);
    }
  }

  let topProblem: DashboardTopProblem | null = null;

  if (negativeCategoryCounts.size > 0) {
    const [topCat] = [...negativeCategoryCounts.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];
    const mentioning = feedbackRows.filter((f) => f.categories.includes(topCat));
    const mentionCount = mentioning.length;
    const negativeMentionCount = negativeFeedbacks.filter((f) =>
      f.categories.includes(topCat)
    ).length;
    const urgentMentionCount = mentioning.filter((f) => f.urgency === "high").length;

    const priority = computePriority({
      mentionCount,
      totalFeedbackCount: totalFeedbacks,
      negativeMentionCount,
      urgentMentionCount,
    });

    const title = CATEGORY_LABELS[topCat as FeedbackCategory] ?? topCat;
    const evidence = [
      ...new Set(
        mentioning
          .map((f) => f.comment?.trim())
          .filter((c): c is string => Boolean(c))
          .map(truncateSnippet)
      ),
    ].slice(0, 3);

    topProblem = {
      id: topCat,
      title,
      mentionCount,
      priority,
      explanation: `${mentionCount} of ${totalFeedbacks} recent customers mentioned ${title.toLowerCase()} or related issues.`,
      evidence,
    };
  }

  let microCoaching: {
    title: string;
    durationMinutes: number;
    basedOnProblemId: string;
  } | null = null;

  if (topProblem) {
    microCoaching = {
      title: MICRO_COACHING_TITLES[topProblem.id as FeedbackCategory] ?? "Customer Service",
      durationMinutes: 5,
      basedOnProblemId: topProblem.id,
    };
  }

  const recentFeedbacks = feedbackRows
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((f) => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      sentiment: f.sentiment,
      summary: f.summary,
      createdAt: f.createdAt,
    }));

  return {
    satisfactionScore,
    averageRating,
    feedbackCount: totalFeedbacks,
    sentimentDistribution,
    positiveInsights,
    negativeInsights,
    topProblem,
    recommendedAction: null,
    microCoaching,
    recentFeedbacks,
  };
}

async function generateRecommendation(
  problem: { category: string; title: string; mentionCount: number; evidence: string[] },
  totalFeedbackCount: number
): Promise<RecommendedActionData | null> {
  const { GROQ_API_KEY } = process.env;
  if (!GROQ_API_KEY) return null;

  const openai = new OpenAI({
    apiKey: GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const prompt = buildRecommendationPrompt({
    category: problem.category,
    title: problem.title,
    mentionCount: problem.mentionCount,
    totalFeedbackCount,
    evidence: problem.evidence,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (typeof content !== "string") return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.warn("Recommendation: JSON parse failed", content.slice(0, 200));
      return null;
    }

    const validation = recommendationSchema.safeParse(parsed);
    if (!validation.success) {
      console.warn("Recommendation validation failed:", JSON.stringify(validation.error.format()));
      return null;
    }

    return validation.data;
  } catch (err) {
    console.error("Recommendation: AI call failed:", err);
    return null;
  }
}

function jsonDashboard(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const handler = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId || !process.env.DATABASE_URL) {
      console.warn("owner-dashboard: serving dummy data (missing businessId or DATABASE_URL)");
      return jsonDashboard(dummyDashboardResponse());
    }

    const db = getDb();

    let rows = await db
      .select({
        id: feedbacks.id,
        rating: feedbacks.rating,
        categories: feedbacks.categories,
        comment: feedbacks.comment,
        createdAt: feedbacks.createdAt,
        sentiment: feedbackAnalyses.sentiment,
        sentimentScore: feedbackAnalyses.sentimentScore,
        summary: feedbackAnalyses.summary,
        urgency: feedbackAnalyses.urgency,
        positiveSignals: feedbackAnalyses.positiveSignals,
        negativeSignals: feedbackAnalyses.negativeSignals,
      })
      .from(feedbacks)
      .leftJoin(feedbackAnalyses, eq(feedbacks.id, feedbackAnalyses.feedbackId))
      .where(eq(feedbacks.businessId, businessId))
      .orderBy(desc(feedbacks.createdAt))
      .limit(200);

    const unanalyzed = rows.filter((r) => r.sentiment === null);

    if (unanalyzed.length > 0) {
      const { GROQ_API_KEY } = process.env;
      if (GROQ_API_KEY) {
        const openai = new OpenAI({
          apiKey: GROQ_API_KEY,
          baseURL: "https://api.groq.com/openai/v1",
        });

        const toAnalyze = unanalyzed.slice(0, MAX_ANALYSES_PER_REQUEST);

        for (const feedback of toAnalyze) {
          try {
            await analyzeOneFeedback(feedback, openai, db);
          } catch (err) {
            console.error("Analysis failed for feedback:", feedback.id, err);
          }
        }

        rows = await db
          .select({
            id: feedbacks.id,
            rating: feedbacks.rating,
            categories: feedbacks.categories,
            comment: feedbacks.comment,
            createdAt: feedbacks.createdAt,
            sentiment: feedbackAnalyses.sentiment,
            sentimentScore: feedbackAnalyses.sentimentScore,
            summary: feedbackAnalyses.summary,
            urgency: feedbackAnalyses.urgency,
            positiveSignals: feedbackAnalyses.positiveSignals,
            negativeSignals: feedbackAnalyses.negativeSignals,
          })
          .from(feedbacks)
          .leftJoin(feedbackAnalyses, eq(feedbacks.id, feedbackAnalyses.feedbackId))
          .where(eq(feedbacks.businessId, businessId))
          .orderBy(desc(feedbacks.createdAt))
          .limit(200);
      }
    }

    const dashboardData = computeDashboard(rows as DashboardFeedback[]);

    if (dashboardData.topProblem) {
      const template =
        RECOMMENDATION_TEMPLATES[dashboardData.topProblem.id as FeedbackCategory] ??
        RECOMMENDATION_TEMPLATES.other;

      let aiRecommendation: RecommendedActionData | null = null;
      try {
        aiRecommendation = await generateRecommendation(
          {
            category: dashboardData.topProblem.id,
            title: dashboardData.topProblem.title,
            mentionCount: dashboardData.topProblem.mentionCount,
            evidence: dashboardData.topProblem.evidence,
          },
          dashboardData.feedbackCount
        );
      } catch (err) {
        console.error("AI recommendation generation failed:", err);
      }

      dashboardData.recommendedAction = aiRecommendation ?? template;
    }

    return new Response(JSON.stringify({ success: true, dashboard: dashboardData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("owner-dashboard: falling back to dummy data:", err);
    return jsonDashboard(dummyDashboardResponse());
  }
};

export default handler;

export const config = {
  path: "/api/owner-dashboard",
};