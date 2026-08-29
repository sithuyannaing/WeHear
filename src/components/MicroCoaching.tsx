import { useRef, useState } from "react";
import type { MicroCoachingData, TopProblemData } from "../lib/types";

interface MicroCoachingProps {
  coaching: MicroCoachingData;
  topProblem?: TopProblemData | null;
}

type SendStatus = "idle" | "sending" | "success" | "error";

const SEND_BUTTON_LABELS: Record<SendStatus, string> = {
  idle: "Send Coaching to Staff",
  sending: "Sending...",
  success: "Coaching Sent ✓",
  error: "Try Again",
};

export default function MicroCoaching({ coaching, topProblem }: MicroCoachingProps) {
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSend() {
    if (sendStatus === "sending") return;

    setSendStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/send-coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: import.meta.env.VITE_DEMO_BUSINESS_ID,
          trainingId: coaching.basedOnProblemId,
          staffId: "demo-staff",
          channel: "telegram",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Coaching could not be sent.");
      }

      setSendStatus("success");
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setSendStatus("idle"), 3000);
    } catch (err) {
      setSendStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Coaching could not be sent.");
    }
  }

  return (
    <section className="dash-card coaching-card">
      <h2 className="dash-card-title">Staff Micro-Coaching</h2>
      <div className="coaching-title">{coaching.title}</div>
      {topProblem && (
        <p className="coaching-based-on">Based on: {topProblem.explanation}</p>
      )}
      <p className="coaching-duration">{coaching.durationMinutes}-minute practice</p>

      <button
        type="button"
        className={`btn btn-coaching ${sendStatus === "error" ? "error" : ""}`}
        onClick={handleSend}
        disabled={sendStatus === "sending"}
      >
        {SEND_BUTTON_LABELS[sendStatus]}
      </button>

      {sendStatus === "error" && errorMessage && (
        <p className="coaching-error" role="alert">{errorMessage}</p>
      )}
    </section>
  );
}