"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import PostsTable from "@/features/posts/PostsTable";
import { useDailyMetrics } from "@/features/metrics/useDailyMetrics";
import { EngagementLineChart } from "./EngagementLineChart";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const {
    data: dailyMetrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDailyMetrics();

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
      setLoading(false);
    }

    loadSession();
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </main>
    );
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
          ) : !dailyMetrics || dailyMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No metrics available.
            </p>
          ) : (
            <EngagementLineChart days={dailyMetrics} />
          )}
        </section>
      </section>
    </main>
  );
}
