"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSignupPage } from "@/app/signup/useSignupPage";

function SignupPageInner() {
  const {
    email,
    password,
    status,
    submitting,
    redirectTo,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useSignupPage();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="h-10 w-full rounded-md border px-3"
              value={email}
              onChange={handleEmailChange}
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
              onChange={handlePasswordChange}
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

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  );
}
