import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

export type DailyMetricPoint = Pick<
  Tables<"daily_metrics">,
  "date" | "engagement" | "reach"
>;

async function fetchDailyMetrics(days: number): Promise<DailyMetricPoint[]> {
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 7), 90) : 30;

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("Not authenticated");

  const search = safeDays ? `?days=${safeDays}` : "";
  const res = await fetch(`/api/metrics/daily${search}`, {
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

export function useDailyMetrics(days = 30) {
  return useQuery({
    queryKey: ["daily-metrics", days],
    queryFn: () => fetchDailyMetrics(days),
  });
}
