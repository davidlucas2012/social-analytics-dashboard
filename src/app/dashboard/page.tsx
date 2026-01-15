"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import PostsTable from "@/features/posts/PostsTable";
import { useDailyMetrics } from "@/features/metrics/useDailyMetrics";
import { EngagementLineChart } from "./EngagementLineChart";
import { useSummary } from "@/features/analytics/useSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function calcEngagementTrend(days: { engagement: number | null }[]) {
  if (!days || days.length < 14) return null;
  const last7 = days.slice(-7).reduce((a, d) => a + (d.engagement ?? 0), 0);
  const prev7 = days
    .slice(-14, -7)
    .reduce((a, d) => a + (d.engagement ?? 0), 0);
  if (prev7 === 0) return null;
  const pct = ((last7 - prev7) / prev7) * 100;
  return Number(pct.toFixed(1));
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
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

  const engagementTrend = dailyMetrics
    ? calcEngagementTrend(dailyMetrics)
    : null;

  const hasEngagementData =
    Array.isArray(dailyMetrics) &&
    dailyMetrics.length > 0 &&
    dailyMetrics.some((d) => (d.engagement ?? 0) > 0);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setEmail(session.user.email ?? null);
    }

    loadSession();
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          onClick={signOut}
          className="h-9 rounded-md border px-3 text-sm"
        >
          Sign out
        </button>
      </header>

      <section className="rounded-xl border p-6">
        <p className="text-sm">
          Signed in as <span className="font-medium">{email}</span>
        </p>
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-28" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))
            : [
                <Card key="total-posts">
                  <CardHeader>
                    <CardTitle>Total posts</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold tabular-nums">
                    {summary?.totalPosts ?? 0}
                  </CardContent>
                </Card>,

                <Card key="avg-engagement">
                  <CardHeader>
                    <CardTitle>Avg engagement rate</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold tabular-nums">
                    {summary?.avgEngagementRate == null
                      ? "—"
                      : `${summary.avgEngagementRate}%`}
                  </CardContent>
                </Card>,

                <Card key="engagement-trend">
                  <CardHeader>
                    <CardTitle>7‑day engagement trend</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold tabular-nums">
                    {metricsLoading ? (
                      <Skeleton className="h-7 w-20" />
                    ) : engagementTrend == null ? (
                      "—"
                    ) : engagementTrend >= 0 ? (
                      <span className="text-green-600">
                        +{engagementTrend}%
                      </span>
                    ) : (
                      <span className="text-red-600">{engagementTrend}%</span>
                    )}
                  </CardContent>
                </Card>,

                <Card key="top-post">
                  <CardHeader>
                    <CardTitle>Top post</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {summaryError ? (
                      <div className="text-sm text-red-600">
                        {(summaryError as Error).message}
                      </div>
                    ) : summary?.topPost ? (
                      <>
                        <div className="text-sm font-medium capitalize">
                          {summary.topPost.platform}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {summary.topPost.caption ?? "(no caption)"}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No posts yet.
                      </div>
                    )}
                  </CardContent>
                </Card>,
              ]}
        </section>
        <PostsTable />
        <section className="rounded-xl border p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Engagement (last 30 days)</h2>
            <p className="text-xs text-muted-foreground">Line chart</p>
          </div>

          {metricsLoading ? (
            <p className="text-sm text-muted-foreground">Loading metrics…</p>
          ) : metricsError ? (
            <p className="text-sm text-red-600">
              Error: {(metricsError as Error).message}
            </p>
          ) : !hasEngagementData ? (
            <p className="text-sm text-muted-foreground text-center">
              No engagement data available for the selected period.
            </p>
          ) : (
            <EngagementLineChart days={dailyMetrics!} />
          )}
        </section>
      </section>
    </main>
  );
}
