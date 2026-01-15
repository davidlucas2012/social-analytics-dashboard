import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type PostRow = {
  id: string;
  caption: string | null;
  platform: string;
  posted_at: string;
};

export function useRlsTestPage() {
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

  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    []
  );

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  return {
    email,
    password,
    status,
    posts,
    loading,
    handleEmailChange,
    handlePasswordChange,
    refreshPosts,
    signIn,
    signOut,
  };
}
