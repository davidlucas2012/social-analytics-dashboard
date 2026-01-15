import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { clearAuthCookies } from "@/lib/supabase/authCookies";
import { useSummary } from "@/features/analytics/useSummary";
import { useDailyMetrics } from "@/features/metrics/useDailyMetrics";

export function useDashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSummary();
  const {
    data: dailyMetrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDailyMetrics();

  const hasEngagementData = useMemo(
    () =>
      Array.isArray(dailyMetrics) &&
      dailyMetrics.length > 0 &&
      dailyMetrics.some((d) => (d.engagement ?? 0) > 0),
    [dailyMetrics]
  );

  const signOut = useCallback(async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    clearAuthCookies();
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);

  return {
    summary,
    summaryLoading,
    summaryError,
    dailyMetrics,
    metricsLoading,
    metricsError,
    hasEngagementData,
    signOut,
    signingOut,
  };
}
