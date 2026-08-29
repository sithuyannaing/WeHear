import type { FeedbackCategory, Rating } from "./lib/types";

export type Screen = "rating" | "topic" | "adaptive" | "thankYou";

export interface TopicOption {
  id: FeedbackCategory;
  label: string;
  icon: string;
}

export interface FeedbackData {
  rating: Rating | null;
  topic: FeedbackCategory | null;
  comment: string;
}
