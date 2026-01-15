"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("usera@test.com");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Signing in…");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(`Error: ${error.message}`);
      return;
    }

    setStatus("Signed in!");
    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="h-10 w-full rounded-md border px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usera@test.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              className="h-10 w-full rounded-md border px-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="h-10 w-full rounded-md bg-black text-white"
          >
            Sign in
          </button>
        </form>

        {status ? (
          <p className="text-sm text-muted-foreground">{status}</p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Use the two Supabase test users you created (User A / User B).
        </p>
      </div>
    </main>
  );
}
