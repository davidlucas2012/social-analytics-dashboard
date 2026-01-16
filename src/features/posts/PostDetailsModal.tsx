"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTimeReadable } from "@/lib/format";
import type { PostWithComputed } from "./types";
import { usePostDetailsModal } from "@/features/posts/usePostDetailsModal";

type PostDetailsModalProps = {
  open: boolean;
  post: PostWithComputed | null;
  onClose: () => void;
};

export function PostDetailsModal({
  open,
  post,
  onClose,
}: PostDetailsModalProps) {
  const {
    imageLoading,
    stats,
    caption,
    mediaType,
    platform,
    handleOpenChange,
    handleImageLoaded,
    permalink,
  } = usePostDetailsModal(post, onClose);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl">
        <DialogHeader className="flex-row items-start justify-between gap-3">
          <div>
            <DialogTitle className="text-lg font-semibold">
              Post details
            </DialogTitle>
          </div>
        </DialogHeader>

        {post ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 w-full">
                <div className="h-24 w-24">
                  {post.thumbnail_url ? (
                    <div className="relative h-full w-full overflow-hidden rounded-xl border shadow-sm">
                      {imageLoading ? (
                        <Skeleton className="absolute inset-0 h-full w-full" />
                      ) : null}
                      <Image
                        src={post.thumbnail_url}
                        alt="Post thumbnail"
                        width={120}
                        height={120}
                        className="h-full w-full object-cover transition duration-300"
                        onLoadingComplete={handleImageLoaded}
                      />
                    </div>
                  ) : (
                    <div className="h-full w-full rounded-xl border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No thumbnail
                    </div>
                  )}
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wide">
                      Platform
                    </span>
                    <span className="text-base font-semibold text-foreground capitalize">
                      {platform}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wide">
                      Media
                    </span>
                    <span className="text-base font-semibold text-foreground capitalize">
                      {mediaType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Posted
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-semibold tracking-wide text-foreground shadow-sm">
                {formatDateTimeReadable(post.posted_at)}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border bg-white p-3 shadow-inner"
                >
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="text-lg font-semibold tabular-nums">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-xl border bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Caption
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {caption}
              </div>
            </div>

            {permalink ? (
              <a
                href={permalink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-full bg-primary text-white items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ExternalLink className="h-4 w-4" />
                View on platform
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">
                No external link provided
              </span>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
