import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

type DailyMetric = {
  date: string;
  engagement: number;
  reach: number;
};

async function fetchDailyMetrics(): Promise<DailyMetric[]> {
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

  const json = await res.json();
  return json.days as DailyMetric[];
}

export function useDailyMetrics() {
  return useQuery({
    queryKey: ["daily-metrics"],
    queryFn: fetchDailyMetrics,
  });
}
