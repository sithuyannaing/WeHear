import type { TopProblemData } from "../lib/types";

interface TopProblemProps {
  problem: TopProblemData;
}

const PRIORITY_LABELS: Record<string, string> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

export default function TopProblem({ problem }: TopProblemProps) {
  return (
    <section className="dash-card problem-card">
      <div className="problem-head">
        <h2 className="dash-card-title">Biggest Service Problem</h2>
        <span className={`priority-badge ${problem.priority}`}>
          {PRIORITY_LABELS[problem.priority] ?? problem.priority}
        </span>
      </div>
      <div className="problem-label">{problem.title}</div>
      <p className="problem-desc">
        Mentioned in <strong>{problem.mentionCount}</strong> recent feedback
      </p>

      <p className="problem-explanation">{problem.explanation}</p>

      {problem.evidence.length > 0 && (
        <div className="problem-evidence">
          <h3 className="dash-sub-title">Why it&apos;s a problem</h3>
          <ul className="evidence-list">
            {problem.evidence.map((snippet, index) => (
              <li key={index} className="evidence-item">"{snippet}"</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}