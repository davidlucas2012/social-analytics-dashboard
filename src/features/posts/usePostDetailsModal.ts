import { useCallback, useMemo, useState } from "react";
import type { PostWithComputed } from "@/features/posts/types";

export function usePostDetailsModal(
  post: PostWithComputed | null,
  onClose: () => void
) {
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null);
  const thumbnailUrl = post?.thumbnail_url ?? null;

  const handleImageLoaded = useCallback(() => {
    if (thumbnailUrl) setLoadedImageKey(thumbnailUrl);
  }, [thumbnailUrl]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) onClose();
    },
    [onClose]
  );

  const stats = useMemo(
    () =>
      post
        ? [
            { label: "Likes", value: post.likes ?? 0 },
            { label: "Comments", value: post.comments ?? 0 },
            { label: "Shares", value: post.shares ?? 0 },
            { label: "Saves", value: post.saves ?? 0 },
            { label: "Reach", value: post.reach ?? 0 },
            { label: "Impressions", value: post.impressions ?? 0 },
            { label: "Engagement total", value: post.engagementTotal },
            {
              label: "Engagement rate",
              value: post.engagementRate == null
                ? "N/A"
                : `${post.engagementRate}%`,
            },
          ]
        : [],
    [post]
  );

  const imageLoading =
    !!thumbnailUrl && loadedImageKey !== thumbnailUrl;

  return {
    imageLoading,
    stats,
    caption: post?.caption ?? "(no caption)",
    mediaType: post?.media_type ?? "",
    platform: post?.platform ?? "",
    handleOpenChange,
    handleImageLoaded,
    permalink: post?.permalink ?? "",
  };
}
