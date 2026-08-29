interface SatisfactionScoreProps {
  satisfactionScore: number;
  averageRating: number;
  feedbackCount: number;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Okay";
  if (score >= 40) return "Poor";
  return "Very poor";
}

export default function SatisfactionScore({ satisfactionScore, averageRating, feedbackCount }: SatisfactionScoreProps) {
  const percent = Math.min(100, Math.max(0, satisfactionScore));

  return (
    <section className="dash-card score-card">
      <h2 className="dash-card-title">Customer Experience</h2>
      <div className="score-value">{satisfactionScore}<span className="score-max"> / 100</span></div>
      <div className="score-label">{getScoreLabel(satisfactionScore)}</div>
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${percent}%` }}></div>
      </div>
      <p className="score-count">
        {averageRating.toFixed(1)} / 5 average · {feedbackCount} feedback{feedbackCount === 1 ? "" : "s"} analyzed
      </p>
    </section>
  );
}