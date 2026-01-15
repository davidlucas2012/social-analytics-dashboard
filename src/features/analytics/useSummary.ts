import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export type SummaryResponse = {
  totalEngagement: number;
  averageEngagementRate: number | null;
  trendPercent: number | null;
  topPost: {
    id: string;
    caption: string | null;
    platform: "instagram" | "tiktok";
    postedAt: string;
    engagementRate: number | null;
    engagementTotal: number;
    permalink: string | null;
    thumbnailUrl: string | null;
  } | null;
  totalPosts: number;
};

async function fetchSummary(): Promise<SummaryResponse> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("Not authenticated");

  const res = await fetch("/api/analytics/summary", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch summary");
  }

  return (await res.json()) as SummaryResponse;
}

export function useSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
  });
}
