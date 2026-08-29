import { eq } from "drizzle-orm";
import type { FeedbackCategory } from "../../src/lib/types.js";
import { getDb } from "../../src/db/index.js";
import { feedbacks, feedbackAnalyses } from "../../src/db/schema.js";
import { aiAnalysisSchema, repairAnalysisOutput } from "../../src/lib/types.js";
import { OpenAI } from "openai";
import { buildAnalyzeFeedbackPrompt } from "./prompts/analyze-feedback.js";

const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body || typeof body !== "object") {
    return new Response(
      JSON.stringify({ success: false, error: "Request body must be an object" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const record = body as Record<string, unknown>;
  const { feedbackId } = record;

  if (
    !feedbackId ||
    typeof feedbackId !== "string" ||
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      feedbackId
    )
  ) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid or missing feedbackId" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const db = getDb();

  try {
    const [feedback] = await db
      .select({ id: feedbacks.id, rating: feedbacks.rating, categories: feedbacks.categories, comment: feedbacks.comment })
      .from(feedbacks)
      .where(eq(feedbacks.id, feedbackId))
      .limit(1);

    if (!feedback) {
      return new Response(
        JSON.stringify({ success: false, error: "Feedback not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const { GROQ_API_KEY } = process.env;
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ success: false, error: "Unable to analyze feedback." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({
      apiKey: GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = buildAnalyzeFeedbackPrompt(
      feedback.rating,
      feedback.categories as FeedbackCategory[],
      feedback.comment ?? null
    );

    let aiResponse: unknown;
    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      aiResponse = completion.choices[0].message.content;
    } catch (err) {
      console.error("Groq API error:", err);
      return new Response(
        JSON.stringify({ success: false, error: "Unable to analyze feedback." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof aiResponse !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Unable to analyze feedback." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Unable to analyze feedback." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const validation = aiAnalysisSchema.safeParse(repairAnalysisOutput(parsed));
    if (!validation.success) {
      console.error("AI response validation failed:", validation.error.format());
      return new Response(
        JSON.stringify({ success: false, error: "Unable to analyze feedback." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const safeData = validation.data;

    try {
      const [analysis] = await db
        .insert(feedbackAnalyses)
        .values({
          feedbackId: feedback.id,
          sentiment: safeData.sentiment,
          sentimentScore: safeData.sentimentScore,
          topics: safeData.topics,
          summary: safeData.summary,
          positiveSignals: safeData.positiveSignals,
          negativeSignals: safeData.negativeSignals,
          urgency: safeData.urgency,
          model: "openai/gpt-oss-20b",
        })
        .onConflictDoUpdate({
          target: feedbackAnalyses.feedbackId,
          set: {
            sentiment: safeData.sentiment,
            sentimentScore: safeData.sentimentScore,
            topics: safeData.topics,
            summary: safeData.summary,
            positiveSignals: safeData.positiveSignals,
            negativeSignals: safeData.negativeSignals,
            urgency: safeData.urgency,
model: "openai/gpt-oss-20b",
            analyzedAt: new Date(),
          },
        })
        .returning();

      return new Response(
        JSON.stringify({
          success: true,
          analysis: {
            id: analysis.id,
            feedbackId: analysis.feedbackId,
            sentiment: analysis.sentiment,
            sentimentScore: analysis.sentimentScore,
            topics: analysis.topics,
            summary: analysis.summary,
            positiveSignals: analysis.positiveSignals,
            negativeSignals: analysis.negativeSignals,
            urgency: analysis.urgency,
            model: analysis.model,
            analyzedAt: analysis.analyzedAt.toISOString(),
            createdAt: analysis.createdAt.toISOString(),
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("DB error in analyze-feedback:", err);
      return new Response(
        JSON.stringify({ success: false, error: "Unable to analyze feedback." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Unexpected error in analyze-feedback:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unable to analyze feedback." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export default handler;

export const config = {
  path: "/api/analyze-feedback",
};