import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "../../src/db/index.js";
import { coachingDeliveries, feedbacks, businesses } from "../../src/db/schema.js";
import { sendCoachingRequestSchema } from "../../src/lib/types.js";
import type { FeedbackCategory } from "../../src/lib/types.js";

const DEMO_STAFF = {
  id: "demo-staff",
  name: "Demo Staff",
  telegramChatId: '5225843007' as string | null,
};

const COACHING_CONTENT: Record<FeedbackCategory, { title: string; practice: string }> = {
  product: {
    title: "Product-Quality Essentials",
    practice: "Check one product against your quality standard before handing it to every customer.",
  },
  service: {
    title: "Service Recovery",
    practice: "When something goes wrong, apologize and offer a concrete fix within 60 seconds.",
  },
  staff: {
    title: "Friendly Customer Service",
    practice: "Greet every customer within 10 seconds of them arriving.",
  },
  waiting_time: {
    title: "Fast Customer Service",
    practice: "Acknowledge waiting customers and give an estimated wait time.",
  },
  price: {
    title: "Value Messaging",
    practice: "Highlight the value of what the customer is getting before mentioning the price.",
  },
  environment: {
    title: "Clean & Inviting Space",
    practice: "Do a 2-minute walkthrough before opening and fix anything out of place.",
  },
  other: {
    title: "Active Listening",
    practice: "Repeat the customer's request back to confirm you understood it.",
  },
};

const COACHING_PROBLEM_LABELS: Record<FeedbackCategory, string> = {
  product: "product quality",
  service: "service",
  staff: "staff interactions",
  waiting_time: "waiting time",
  price: "pricing",
  environment: "the environment",
  other: "a recent issue",
};

const RECENT_DUPLICATE_WINDOW_MS = 60 * 60 * 1000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function buildReason(
  db: ReturnType<typeof getDb>,
  businessId: string,
  problemId: FeedbackCategory
): Promise<string> {
  try {
    const [row] = await db
      .select({
        total: sql<number>`count(*)::int`.mapWith(Number),
        mentions: sql<number>`count(*) filter (where ${problemId} = any(${feedbacks.categories}))::int`.mapWith(
          Number
        ),
      })
      .from(feedbacks)
      .where(eq(feedbacks.businessId, businessId));

    if (row && row.total > 0 && row.mentions > 0) {
      return `${row.mentions} of ${row.total} recent customers mentioned ${COACHING_PROBLEM_LABELS[problemId]} or related issues.`;
    }
  } catch (err) {
    console.error("send-coaching: failed to build reason from feedback:", err);
  }
  return `Recent customers flagged ${COACHING_PROBLEM_LABELS[problemId]} as a problem area.`;
}

function buildN8nPayload(input: {
  businessId: string;
  trainingId: string;
  staffId: string;
  channel: string;
  content: { title: string; practice: string };
  reason: string;
}) {
  return {
    event: "staff_coaching",
    businessId: input.businessId,
    problemId: input.trainingId,
    trainingId: input.trainingId,
    staffId: input.staffId,
    channel: input.channel,
    recipient: {
      telegramChatId: DEMO_STAFF.telegramChatId,
    },
    coaching: {
      title: input.content.title,
      reason: input.reason,
      practice: input.content.practice,
    },
  };
}

async function callN8nWebhook(payload: Record<string, unknown>): Promise<void> {
  const webhookUrl = process.env.N8N_STAFF_COACHING_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "send-coaching: N8N_STAFF_COACHING_WEBHOOK_URL is not set. Skipping webhook call. Payload:",
      JSON.stringify(payload)
    );
    return;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`n8n webhook responded with status ${res.status}: ${body.slice(0, 300)}`);
  }
}

const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const parsed = sendCoachingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: "Invalid request." }, 400);
  }

  const { businessId, trainingId, staffId, channel } = parsed.data;
  const problemId = trainingId as FeedbackCategory;

  if (!process.env.DATABASE_URL || businessId === "demo") {
    return json({ success: true, deliveryId: "demo-delivery", demo: true });
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    console.warn("send-coaching: DB unavailable, returning demo success:", err);
    return json({ success: true, deliveryId: "demo-delivery", demo: true });
  }

  try {
    const [business] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business) {
      console.warn("send-coaching: unknown businessId, returning demo success");
      return json({ success: true, deliveryId: "demo-delivery", demo: true });
    }

    const recentCutoff = new Date(Date.now() - RECENT_DUPLICATE_WINDOW_MS);
    const [recentDelivery] = await db
      .select({ id: coachingDeliveries.id })
      .from(coachingDeliveries)
      .where(
        and(
          eq(coachingDeliveries.businessId, businessId),
          eq(coachingDeliveries.staffId, staffId),
          eq(coachingDeliveries.problemId, problemId),
          eq(coachingDeliveries.status, "sent"),
          gte(coachingDeliveries.sentAt, recentCutoff)
        )
      )
      .limit(1);

    if (recentDelivery) {
      return json(
        { success: false, error: "This coaching was already sent recently." },
        409
      );
    }

    const content = COACHING_CONTENT[problemId];
    const reason = await buildReason(db, businessId, problemId);

    const [delivery] = await db
      .insert(coachingDeliveries)
      .values({
        businessId,
        problemId,
        trainingTitle: content.title,
        staffId,
        channel,
        recipient: DEMO_STAFF.telegramChatId ?? null,
        status: "pending",
      })
      .returning({ id: coachingDeliveries.id });

    const payload = buildN8nPayload({
      businessId,
      trainingId,
      staffId,
      channel,
      content,
      reason,
    });

    try {
      await callN8nWebhook(payload);
    } catch (err) {
      console.error("send-coaching: webhook call failed:", err);
      await db
        .update(coachingDeliveries)
        .set({ status: "failed" })
        .where(eq(coachingDeliveries.id, delivery.id));
      return json(
        { success: false, error: "Coaching could not be sent. Please try again." },
        502
      );
    }

    await db
      .update(coachingDeliveries)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(coachingDeliveries.id, delivery.id));

    return json({ success: true, deliveryId: delivery.id });
  } catch (err) {
    console.warn("send-coaching: falling back to demo success:", err);
    return json({ success: true, deliveryId: "demo-delivery", demo: true });
  }
};

export default handler;

export const config = {
  path: "/api/send-coaching",
};