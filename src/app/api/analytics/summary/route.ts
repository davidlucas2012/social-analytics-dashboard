import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase/server";

type SummaryResponse = {
  totalPosts: number;
  avgEngagementRate: number | null;
  topPost: {
    id: string;
    caption: string | null;
    platform: "instagram" | "tiktok";
    postedAt: string;
    engagementRate: number | null;
  } | null;
};

export async function GET(req: Request) {
  // We prefer the bearer token from the request to guarantee RLS is applied per-user.
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : undefined;

  const supabase = await supabaseServerClient(token);

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, caption, platform, posted_at, engagement_rate")
    .order("posted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const totalPosts = posts?.length ?? 0;

  const rates = (posts ?? [])
    .map((p) => (p.engagement_rate ?? null) as number | null)
    .filter((v): v is number => typeof v === "number");

  const avgEngagementRate =
    rates.length === 0
      ? null
      : Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2));

  const top =
    (posts ?? [])
      .filter((p) => typeof p.engagement_rate === "number")
      .sort(
        (a, b) => (b.engagement_rate as number) - (a.engagement_rate as number)
      )[0] ?? null;

  const topPost = top
    ? {
        id: top.id as string,
        caption: (top.caption as string | null) ?? null,
        platform: top.platform as "instagram" | "tiktok",
        postedAt: top.posted_at as string,
        engagementRate: (top.engagement_rate as number | null) ?? null,
      }
    : null;

  const payload: SummaryResponse = {
    totalPosts,
    avgEngagementRate,
    topPost,
  };

  return NextResponse.json(payload);
}
