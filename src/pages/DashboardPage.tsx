import { useCallback, useEffect, useState } from "react";
import BusinessDashboard from "../components/dashboard/BusinessDashboard";
import { DUMMY_DASHBOARD } from "../lib/dummyDashboard";
import type { OwnerDashboardData } from "../lib/types";

type LoadState = "loading" | "success" | "error" | "empty";

export default function DashboardPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | undefined>();

  const load = useCallback(async () => {
    setState("loading");
    setErrorMessage("");

    try {
      const businessId = import.meta.env.VITE_DEMO_BUSINESS_ID || "demo";
      const res = await fetch(
        `/api/owner-dashboard?businessId=${encodeURIComponent(businessId)}`
      );
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to load dashboard");
      }

      const dashboard = result.dashboard as OwnerDashboardData;
      setData(dashboard);
      setUpdatedAt(new Date());
      setState(dashboard.feedbackCount === 0 ? "empty" : "success");
    } catch (err) {
      console.warn("Dashboard API unavailable, using dummy data:", err);
      setData(DUMMY_DASHBOARD);
      setUpdatedAt(new Date());
      setState("success");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="dashboard-page">
      <BusinessDashboard
        state={state}
        data={data}
        errorMessage={errorMessage}
        updatedAt={updatedAt}
        onRetry={() => void load()}
      />
    </div>
  );
}
