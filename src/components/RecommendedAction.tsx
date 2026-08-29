import type { RecommendedActionData } from "../lib/types";

interface RecommendedActionProps {
  action: RecommendedActionData;
}

export default function RecommendedAction({ action }: RecommendedActionProps) {
  return (
    <section className="dash-card action-card">
      <h2 className="dash-card-title">Recommended Action</h2>
      <p className="action-text">{action.title}</p>
      <div className="action-tip">
        <span className="action-tip-label">Why</span>
        <p>{action.reason}</p>
      </div>
      <div className="action-goal">
        <span className="action-goal-label">Expected goal</span>
        <p>{action.expectedGoal}</p>
      </div>
    </section>
  );
}