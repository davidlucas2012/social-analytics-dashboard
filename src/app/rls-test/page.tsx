"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type PostRow = {
  id: string;
  caption: string | null;
  platform: string;
  posted_at: string;
};

export default function RlsTestPage() {
  const [email, setEmail] = useState("usera@test.com");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshPosts = useCallback(async () => {
    setLoading(true);
    setStatus("Loading posts…");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session) {
        setStatus("Not signed in. Enter credentials and sign in first.");
        setPosts([]);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id, caption, platform, posted_at")
        .order("posted_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setPosts(data ?? []);
      setStatus(`Loaded ${data?.length ?? 0} post(s).`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load posts.";
      setStatus(`Error: ${message}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    setStatus("Signing in…");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(`Sign-in error: ${error.message}`);
      setLoading(false);
      return;
    }

    setStatus("Signed in. Fetching posts…");
    await refreshPosts();
  }, [email, password, refreshPosts]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setPosts([]);
    setStatus("Signed out.");
  }, []);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">RLS Smoke Test</h1>

      <div className="space-y-2 rounded-lg border p-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Email</label>
          <input
            className="h-10 rounded-md border px-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usera@test.com"
          />
          <label className="text-sm font-medium">Password</label>
          <input
            className="h-10 rounded-md border px-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password for the test user"
            type="password"
          />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="h-10 rounded-md bg-black px-4 text-white"
            onClick={signIn}
            disabled={loading}
          >
            Sign in
          </button>
          <button
            className="h-10 rounded-md border px-4"
            onClick={signOut}
            disabled={loading}
          >
            Sign out
          </button>
          <button
            className="h-10 rounded-md border px-4"
            onClick={refreshPosts}
            disabled={loading}
          >
            Refresh posts
          </button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{status}</p>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <h2 className="font-medium">Visible posts</h2>
        <ul className="list-disc pl-5 text-sm space-y-1">
          {posts.map((p) => (
            <li key={p.id}>
              <span className="font-medium">{p.platform}</span>:{" "}
              {p.caption ?? "(no caption)"}
            </li>
          ))}
        </ul>

        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts visible.</p>
        ) : null}
      </div>
    </div>
  );
}
