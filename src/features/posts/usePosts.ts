import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

export type PostRow = Tables<"posts">;

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
      "id,user_id,platform,caption,media_type,posted_at,likes,comments,shares,saves,reach,impressions,engagement_rate,created_at,permalink,thumbnail_url"
    )
    .order("posted_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
}
