import {
  pgTable,
  uuid,
  integer,
  text,
  pgEnum,
  timestamp,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const feedbackCategoryEnum = pgEnum("feedback_category", [
  "product",
  "service",
  "staff",
  "waiting_time",
  "price",
  "environment",
  "other",
]);

export const feedbackSourceEnum = pgEnum("feedback_source", ["qr", "web"]);

export const sentimentEnum = pgEnum("sentiment", [
  "positive",
  "neutral",
  "negative",
]);

export const urgencyEnum = pgEnum("urgency", ["low", "medium", "high"]);

export const coachingChannelEnum = pgEnum("coaching_channel", [
  "telegram",
  "email",
  "viber",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "sent",
  "failed",
]);

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const feedbacks = pgTable("feedbacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id),
  rating: integer("rating").notNull(),
  categories: feedbackCategoryEnum("categories").array().notNull().default([]),
  comment: text("comment"),
  source: feedbackSourceEnum("source").notNull().default("web"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const feedbackAnalyses = pgTable(
  "feedback_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedbacks.id),
    sentiment: sentimentEnum("sentiment").notNull(),
    sentimentScore: real("sentiment_score").notNull(),
    topics: text("topics").array().notNull().default([]),
    summary: text("summary").notNull(),
    positiveSignals: text("positive_signals").array().notNull().default([]),
    negativeSignals: text("negative_signals").array().notNull().default([]),
    urgency: urgencyEnum("urgency").notNull(),
    model: text("model"),
    analyzedAt: timestamp("analyzed_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("feedback_analyses_feedback_id_idx").on(table.feedbackId),
  ],
);

export const coachingDeliveries = pgTable("coaching_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id),
  problemId: text("problem_id").notNull(),
  trainingTitle: text("training_title").notNull(),
  staffId: text("staff_id").notNull(),
  channel: coachingChannelEnum("channel").notNull().default("telegram"),
  recipient: text("recipient"),
  status: deliveryStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});