"use client";

import { ArrowDownRight, ArrowUpRight, LogOut } from "lucide-react";
import PostsTable from "@/features/posts/PostsTable";
import { EngagementLineChart } from "./EngagementLineChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardClient } from "@/app/dashboard/useDashboardClient";

type DashboardClientProps = {
  email: string | null;
};

export function DashboardClient({ email }: DashboardClientProps) {
  const {
    summary,
    summaryLoading,
    summaryError,
    dailyMetrics,
    metricsLoading,
    metricsError,
    hasEngagementData,
    signOut,
    signingOut,
  } = useDashboardClient();

  return (
    <main className="min-h-screen p-6 space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {email ?? "—"}
            </span>
          </p>
        </div>
        <button
          onClick={signOut}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          disabled={signingOut}
          aria-label="Sign out"
          title={signingOut ? "Signing out…" : "Sign out"}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <section className="rounded-2xl border bg-white/75 p-6 shadow-sm backdrop-blur-sm gap-6 space-y-6">
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
                <Card key="total-engagement">
                  <CardHeader>
                    <CardTitle>Total engagement</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold tabular-nums">
                    {summary?.totalEngagement?.toLocaleString() ?? "0"}
                  </CardContent>
                </Card>,

                <Card key="avg-engagement">
                  <CardHeader>
                    <CardTitle>Avg engagement rate</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold tabular-nums">
                    {summary?.averageEngagementRate == null
                      ? "—"
                      : `${summary.averageEngagementRate}%`}
                  </CardContent>
                </Card>,

                <Card key="engagement-trend">
                  <CardHeader>
                    <CardTitle>7‑day engagement trend</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2 text-2xl font-semibold tabular-nums">
                    {summaryError ? (
                      <span className="text-sm text-red-600">
                        {(summaryError as Error).message}
                      </span>
                    ) : summary?.trendPercent == null ? (
                      "—"
                    ) : summary.trendPercent >= 0 ? (
                      <>
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                        <span className="text-green-600">
                          +{summary.trendPercent}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                        <span className="text-red-600">
                          {summary.trendPercent}%
                        </span>
                      </>
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
                        <div className="text-xs text-muted-foreground">
                          {summary.topPost.engagementTotal.toLocaleString()}{" "}
                          total interactions •{" "}
                          {summary.topPost.engagementRate == null
                            ? "N/A"
                            : `${summary.topPost.engagementRate}% engagement rate`}
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
        <section className="rounded-xl border p-6">
          <PostsTable />
        </section>
      </section>
    </main>
  );
}
