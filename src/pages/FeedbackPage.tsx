import { useState } from "react";
import { FEEDBACK_CATEGORIES } from "../lib/types";
import type { FeedbackCategory, Rating } from "../lib/types";

const RATING_OPTIONS: { value: Rating; label: string }[] = [
  { value: 1, label: "Very bad" },
  { value: 2, label: "Bad" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  product: "Product",
  service: "Service",
  staff: "Staff",
  waiting_time: "Waiting Time",
  price: "Price",
  environment: "Environment",
  other: "Other",
};

function getStep2Title(rating: Rating): string {
  if (rating <= 2) return "We're sorry. What could we improve?";
  if (rating === 3) return "How could we make your next experience better?";
  return "Great to hear! What did you like most?";
}

export default function FeedbackPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [rating, setRating] = useState<Rating | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<FeedbackCategory[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleRatingSelect(value: Rating) {
    setRating(value);
    setStep(2);
  }

  function handleCategoryToggle(cat: FeedbackCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || selectedCategories.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: import.meta.env.VITE_DEMO_BUSINESS_ID,
          rating,
          categories: selectedCategories,
          comment: comment.trim() || undefined,
          source: "web",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setStep(1);
    setRating(null);
    setSelectedCategories([]);
    setComment("");
    setIsSubmitting(false);
    setSubmitStatus("idle");
    setErrorMessage("");
  }

  if (submitStatus === "success") {
    return (
      <div className="feedback-container">
        <div className="feedback-card">
          <h1>Thank you!</h1>
          <p>Your feedback has been recorded. We appreciate you taking the time.</p>
          <button type="button" className="btn btn-primary" onClick={handleReset}>
            Submit another feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        {step === 1 && (
          <fieldset className="rating-fieldset">
            <legend className="feedback-title">How was your experience?</legend>
            <div className="rating-buttons" role="radiogroup" aria-label="Rating">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="rating-btn"
                  onClick={() => handleRatingSelect(opt.value)}
                  aria-label={`Rate ${opt.label}`}
                >
                  <span className="rating-number">{opt.value}</span>
                  <span className="rating-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && rating !== null && (
          <form onSubmit={handleSubmit}>
            <h1 className="feedback-title">{getStep2Title(rating)}</h1>

            <fieldset className="category-fieldset">
              <legend className="sr-only">Select categories</legend>
              <div className="category-grid">
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-btn ${selectedCategories.includes(cat) ? "selected" : ""}`}
                    onClick={() => handleCategoryToggle(cat)}
                    aria-pressed={selectedCategories.includes(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="comment-label" htmlFor="comment">
              Want to tell us more? (optional)
            </label>
            <textarea
              id="comment"
              className="comment-input"
              rows={3}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your feedback..."
            />

            {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={selectedCategories.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
