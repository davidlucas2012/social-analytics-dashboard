"use client";

import { usePosts } from "@/features/posts/usePosts";

export default function PostsTable() {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">Loading posts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-6">
        <p className="text-sm text-red-600">
          Failed to load posts: {(error as Error).message}
        </p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6">
      <p className="text-sm">
        Posts loaded: <span className="font-medium">{posts.length}</span>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Next step: TanStack Table (sorting/filtering/responsive/skeleton).
      </p>
    </div>
  );
}
