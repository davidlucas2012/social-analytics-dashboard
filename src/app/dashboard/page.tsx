"use client";

import { usePosts } from "@/features/posts/usePosts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import PostsTable from "@/features/posts/PostsTable";

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
        <PostsTable />
      </section>
    </main>
  );
}
