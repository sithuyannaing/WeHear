import { getDb } from "../../src/db/index.js";
import { feedbacks, feedbackAnalyses } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";

const handler = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    const db = getDb();

    const baseQuery = db
      .select({
        id: feedbacks.id,
        rating: feedbacks.rating,
        categories: feedbacks.categories,
        comment: feedbacks.comment,
        createdAt: feedbacks.createdAt,
        analysis: {
          sentiment: feedbackAnalyses.sentiment,
          sentimentScore: feedbackAnalyses.sentimentScore,
          summary: feedbackAnalyses.summary,
          urgency: feedbackAnalyses.urgency,
        },
      })
      .from(feedbacks)
      .leftJoin(feedbackAnalyses, eq(feedbacks.id, feedbackAnalyses.feedbackId));

    const results = businessId
      ? await baseQuery.where(eq(feedbacks.businessId, businessId)).limit(50)
      : await baseQuery.limit(50);

    const formatted = results.map((row) => ({
      id: row.id,
      rating: row.rating,
      categories: row.categories,
      comment: row.comment,
      createdAt: row.createdAt,
      sentiment: row.analysis?.sentiment,
      sentimentScore: row.analysis?.sentimentScore,
      summary: row.analysis?.summary,
      urgency: row.analysis?.urgency,
    }));

    return new Response(JSON.stringify({ success: true, feedbacks: formatted }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("DB error in list-feedbacks:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unable to fetch feedbacks." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export default handler;

export const config = {
  path: "/api/feedbacks",
};