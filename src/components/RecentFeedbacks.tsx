interface RecentFeedback {
  id: string;
  rating: number;
  comment: string | null;
  sentiment: string | null;
  summary: string | null;
  createdAt: string;
}

interface RecentFeedbacksProps {
  items: RecentFeedback[];
}

function getSentimentClass(sentiment: string | null): string {
  if (sentiment === "positive") return "positive";
  if (sentiment === "negative") return "negative";
  return "neutral";
}

function getRatingLabel(rating: number): string {
  return ["", "Very bad", "Bad", "Okay", "Good", "Excellent"][rating] ?? "";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecentFeedbacks({ items }: RecentFeedbacksProps) {
  if (items.length === 0) return null;

  return (
    <section className="dash-card">
      <h2 className="dash-card-title">Recent Feedback</h2>
      <ul className="recent-list">
        {items.map((item) => (
          <li key={item.id} className="recent-item">
            <div className="recent-header">
              <div className="recent-stars">
                {"★".repeat(item.rating)}
                {"☆".repeat(5 - item.rating)}
              </div>
              <span className="recent-rating-label">{getRatingLabel(item.rating)}</span>
              {item.sentiment && (
                <span className={`recent-sentiment ${getSentimentClass(item.sentiment)}`}>
                  {item.sentiment}
                </span>
              )}
              {item.createdAt && (
                <span className="recent-date">{formatDate(item.createdAt)}</span>
              )}
            </div>
            {item.summary && <p className="recent-summary">{item.summary}</p>}
            {item.comment && <p className="recent-comment">"{item.comment}"</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
