"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useLoginPage } from "@/app/login/useLoginPage";

function LoginPageInner() {
  const {
    email,
    password,
    status,
    submitting,
    redirectTo,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useLoginPage();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="h-10 w-full rounded-md border px-3"
              value={email}
              onChange={handleEmailChange}
              placeholder="usera@test.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              className="h-10 w-full rounded-md border px-3"
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="h-10 w-full rounded-md bg-black text-white disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="space-y-2 text-sm">
          {status ? (
            <p className="text-muted-foreground">{status}</p>
          ) : null}
          <p className="text-muted-foreground">
            Need an account?{" "}
            <Link className="underline" href={`/signup?redirect=${redirectTo}`}>
              Sign up
            </Link>
            .
          </p>
          <p className="text-xs text-muted-foreground">
            Use your Supabase auth users (User A / User B) or create a new one.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
