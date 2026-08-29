interface RecommendationInput {
  category: string;
  title: string;
  mentionCount: number;
  totalFeedbackCount: number;
  evidence: string[];
}

export function buildRecommendationPrompt(input: RecommendationInput): string {
  const evidenceList =
    input.evidence.length > 0
      ? input.evidence.map((e) => `- "${e}"`).join("\n")
      : "- (customers did not leave written comments, only affected category selections and ratings)";

  return `SYSTEM INSTRUCTIONS

You are an operations coach helping a small business owner take one concrete action.

A service problem has been identified from aggregated customer feedback. Recommend ONE actionable next step the owner should take this week.

Rules:
1. Base everything only on the problem described and the evidence provided.
2. Never invent facts, metrics, or customer quotes.
3. Recommend ONE concrete action, not a vague suggestion. Avoid phrases like "improve customer service" or "review your process".
4. Tie the reason to the evidence given.
5. Return valid structured JSON only.

SERVICE PROBLEM

<problem>
Category: ${input.category}
Title: ${input.title}
Mentioned in ${input.mentionCount} of ${input.totalFeedbackCount} recent feedback records.
</problem>

EVIDENCE FROM CUSTOMERS

<evidence>
${evidenceList}
</evidence>

Return ONLY a valid JSON object matching this exact schema (no prose, no markdown, no extra keys):

{
  "title": "One concrete action for the owner, e.g. 'Assign an extra staff member to checkout between 5-7 PM.'",
  "reason": "Why this action addresses the problem, tied to the evidence.",
  "expectedGoal": "The measurable outcome expected, e.g. 'Reduce waiting-time complaints.'"
}`;
}