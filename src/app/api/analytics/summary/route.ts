import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

type SummaryResponse = {
  totalEngagement: number;
  totalPosts: number;
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
  previousPeriodEngagement: number;
  currentPeriodEngagement: number;
};

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token?.trim()) {
    return null;
  }

  return token.trim();
}

function formatDateYYYYMMDD(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calculateTrendPercent(metrics: Pick<Tables<"daily_metrics">, "date" | "engagement">[]): number | null {
  // Fill the last 14 days (UTC) with zeros where data is missing.
  const today = new Date();
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  start.setUTCDate(start.getUTCDate() - 13);

  const lookup = new Map<string, number>();
  for (const row of metrics) {
    lookup.set(row.date, (row.engagement ?? 0) as number);
  }

  const series: number[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = formatDateYYYYMMDD(d);
    series.push(lookup.get(key) ?? 0);
  }

  const prev7 = series.slice(0, 7).reduce((a, b) => a + b, 0);
  const last7 = series.slice(7).reduce((a, b) => a + b, 0);

  if (prev7 === 0) return null;
  const pct = ((last7 - prev7) / prev7) * 100;
  return Number(pct.toFixed(1));
}

export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await supabaseServerClient(token);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(
        "id, caption, platform, posted_at, engagement_rate, likes, comments, shares, saves, permalink, thumbnail_url"
      )
      .order("posted_at", { ascending: false });

    if (postsError) {
      return NextResponse.json({ message: postsError.message }, { status: 400 });
    }

    const totalEngagement = (posts ?? []).reduce((acc, post) => {
      const likes = post.likes ?? 0;
      const comments = post.comments ?? 0;
      const shares = post.shares ?? 0;
      const saves = post.saves ?? 0;
      return acc + likes + comments + shares + saves;
    }, 0);

    const engagementRates = (posts ?? [])
      .map((p) => (p.engagement_rate ?? null) as number | null)
      .filter((v): v is number => typeof v === "number");

    const averageEngagementRate =
      engagementRates.length === 0
        ? null
        : Number(
            (engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length).toFixed(2)
          );

    const top =
      (posts ?? []).reduce<{
        engagementTotal: number;
        post: (typeof posts)[number] | null;
      }>(
        (acc, post) => {
          const engagementTotal =
            (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0) + (post.saves ?? 0);
          if (engagementTotal > acc.engagementTotal) {
            return { engagementTotal, post };
          }
          return acc;
        },
        { engagementTotal: -Infinity, post: null }
      ).post ?? null;

    const topPost = top
      ? {
          id: top.id,
          caption: top.caption ?? null,
          platform: top.platform as "instagram" | "tiktok",
          postedAt: top.posted_at,
          engagementRate: (top.engagement_rate as number | null) ?? null,
          engagementTotal:
            (top.likes ?? 0) + (top.comments ?? 0) + (top.shares ?? 0) + (top.saves ?? 0),
          permalink: top.permalink ?? null,
          thumbnailUrl: top.thumbnail_url ?? null,
        }
      : null;

    const today = new Date();
    const start = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    start.setUTCDate(start.getUTCDate() - 13);
    const startStr = formatDateYYYYMMDD(start);
    const endStr = formatDateYYYYMMDD(today);

    const { data: metrics, error: metricsError } = await supabase
      .from("daily_metrics")
      .select("date, engagement")
      .gte("date", startStr)
      .lte("date", endStr)
      .order("date", { ascending: true });

    if (metricsError) {
      return NextResponse.json({ message: metricsError.message }, { status: 400 });
    }

    const trendPercent = calculateTrendPercent(metrics ?? []);
    const currentPeriodEngagement =
      metrics?.slice(-7).reduce((sum, row) => sum + (row.engagement ?? 0), 0) ?? 0;
    const previousPeriodEngagement =
      metrics?.slice(0, Math.max(0, (metrics?.length ?? 0) - 7)).reduce((sum, row) => sum + (row.engagement ?? 0), 0) ?? 0;

    const payload: SummaryResponse = {
      totalEngagement,
      totalPosts: posts?.length ?? 0,
      averageEngagementRate,
      trendPercent,
      topPost,
      currentPeriodEngagement,
      previousPeriodEngagement,
    };

    return NextResponse.json(payload);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected error while building summary";
    return NextResponse.json({ message }, { status: 500 });
  }
}
