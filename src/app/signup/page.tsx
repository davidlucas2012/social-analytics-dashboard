"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { writeAuthCookies } from "@/lib/supabase/authCookies";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("Creating account…");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined,
      },
    });

    if (error) {
      setStatus(`Error: ${error.message}`);
      setSubmitting(false);
      return;
    }

    if (data?.session) {
      writeAuthCookies(data.session);
      setStatus("Account created. Redirecting…");
      router.replace(redirectTo);
      return;
    }

    setStatus("Check your email to confirm your account, then sign in.");
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="h-10 w-full rounded-md border px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
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
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="h-10 w-full rounded-md bg-black text-white disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <div className="space-y-1 text-sm">
          {status ? (
            <p className="text-muted-foreground">{status}</p>
          ) : null}
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link className="underline" href={`/login?redirect=${redirectTo}`}>
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
