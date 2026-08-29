import type { CustomerInsight } from "../lib/types";

interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

interface InsightsListProps {
  positiveInsights: CustomerInsight[];
  negativeInsights: CustomerInsight[];
  sentimentDistribution: SentimentDistribution;
  totalFeedbacks: number;
}

function InsightColumn({ title, items, tone }: { title: string; items: CustomerInsight[]; tone: "positive" | "negative" }) {
  return (
    <div className={`insight-column ${tone}`}>
      <h3 className="dash-sub-title">{title}</h3>
      {items.length === 0 ? (
        <p className="dash-empty-text">No {tone} themes yet.</p>
      ) : (
        <ul className="insight-list">
          {items.map((item) => (
            <li key={item.label} className="insight-item">
              <span className="insight-label">{item.label}</span>
              <span className="insight-count">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function InsightsList({ positiveInsights, negativeInsights, sentimentDistribution, totalFeedbacks }: InsightsListProps) {
  return (
    <section className="dash-card">
      <h2 className="dash-card-title">Customer Insights</h2>

      <div className="sentiment-row">
        <div className="sentiment-item positive">
          <span className="sentiment-count">{sentimentDistribution.positive}</span>
          <span className="sentiment-label">Positive</span>
        </div>
        <div className="sentiment-item neutral">
          <span className="sentiment-count">{sentimentDistribution.neutral}</span>
          <span className="sentiment-label">Neutral</span>
        </div>
        <div className="sentiment-item negative">
          <span className="sentiment-count">{sentimentDistribution.negative}</span>
          <span className="sentiment-label">Negative</span>
        </div>
      </div>

      <div className="insight-columns">
        <InsightColumn title="Customers Love" items={positiveInsights} tone="positive" />
        <InsightColumn title="Needs Attention" items={negativeInsights} tone="negative" />
      </div>

      <p className="dash-meta">{totalFeedbacks} total feedback</p>
    </section>
  );
}