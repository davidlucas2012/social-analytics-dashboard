"use client";

import { usePosts } from "@/features/posts/usePosts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = usePosts();

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
        <div className="mt-4 space-y-2">
          <p className="text-sm">
            Posts visible (RLS enforced):{" "}
            <span className="font-medium">
              {postsLoading ? "Loading…" : posts?.length ?? 0}
            </span>
          </p>

          {postsError ? (
            <p className="text-sm text-red-600">
              Error loading posts: {(postsError as Error).message}
            </p>
          ) : null}

          {posts && posts.length > 0 ? (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {posts.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <span className="font-medium">{p.platform}</span>:{" "}
                  {p.caption ?? "(no caption)"}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Dashboard content will go here.
        </p>
      </section>
    </main>
  );
}
