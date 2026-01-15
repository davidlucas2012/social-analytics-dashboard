import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export type PostRow = {
  id: string;
  user_id: string;
  platform: "instagram" | "tiktok";
  caption: string | null;
  media_type: "image" | "video" | "carousel";
  posted_at: string;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  reach: number | null;
  impressions: number | null;
  engagement_rate: number | null;
};

async function fetchPosts(): Promise<PostRow[]> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,user_id,platform,caption,media_type,posted_at,likes,comments,shares,saves,reach,impressions,engagement_rate"
    )
    .order("posted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PostRow[];
}

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
}
