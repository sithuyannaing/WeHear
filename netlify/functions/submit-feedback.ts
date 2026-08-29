import { eq } from "drizzle-orm";
import { getDb } from "../../src/db/index.js";
import { businesses, feedbacks } from "../../src/db/schema.js";

const VALID_CATEGORIES = [
  "product",
  "service",
  "staff",
  "waiting_time",
  "price",
  "environment",
  "other",
] as const;

const VALID_SOURCES = ["qr", "web"] as const;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  if (!body || typeof body !== "object") {
    return json({ success: false, error: "Request body must be an object" }, 400);
  }

  const record = body as Record<string, unknown>;
  const { businessId, rating, categories, comment, source } = record;

  if (!businessId || typeof businessId !== "string") {
    return json({ success: false, error: "businessId is required and must be a string" }, 400);
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ success: false, error: "rating must be an integer between 1 and 5" }, 400);
  }

  if (!Array.isArray(categories)) {
    return json({ success: false, error: "categories must be an array" }, 400);
  }

  for (const cat of categories) {
    if (!VALID_CATEGORIES.includes(cat as (typeof VALID_CATEGORIES)[number])) {
      return json({ success: false, error: `Invalid category: ${cat}` }, 400);
    }
  }

  const uniqueCategories = [...new Set(categories)];
  if (uniqueCategories.length === 0) {
    return json({ success: false, error: "At least one category is required" }, 400);
  }

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== "string") {
      return json({ success: false, error: "comment must be a string" }, 400);
    }
    if (comment.length > 1000) {
      return json({ success: false, error: "comment must be 1000 characters or less" }, 400);
    }
  }

  const feedbackSource =
    source && VALID_SOURCES.includes(source as (typeof VALID_SOURCES)[number])
      ? source
      : "web";

  const db = getDb();

  try {
    const [business] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business) {
      return json({ success: false, error: "Invalid businessId" }, 400);
    }

    const [feedback] = await db
      .insert(feedbacks)
      .values({
        businessId,
        rating,
        categories: uniqueCategories as (typeof VALID_CATEGORIES)[number][],
        comment: (comment as string) || null,
        source: feedbackSource as "qr" | "web",
      })
      .returning({ id: feedbacks.id });

    return json({ success: true, feedbackId: feedback.id });
  } catch (err) {
    console.error("DB error in submit-feedback:", err);
    return json({ success: false, error: "Unable to save feedback." }, 500);
  }
};

export const config = {
  path: "/api/feedback",
};