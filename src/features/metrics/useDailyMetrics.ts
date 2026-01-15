import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

export type DailyMetricPoint = Pick<
  Tables<"daily_metrics">,
  "date" | "engagement" | "reach"
>;

async function fetchDailyMetrics(): Promise<DailyMetricPoint[]> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("Not authenticated");

  const res = await fetch("/api/metrics/daily", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch daily metrics");
  }

  const json: { days: DailyMetricPoint[] } = await res.json();
  return json.days;
}

export function useDailyMetrics() {
  return useQuery({
    queryKey: ["daily-metrics"],
    queryFn: fetchDailyMetrics,
  });
}
