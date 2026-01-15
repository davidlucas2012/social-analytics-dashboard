"use client";

import { useRlsTestPage } from "@/app/rls-test/useRlsTestPage";

export default function RlsTestPage() {
  const {
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
  } = useRlsTestPage();

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">RLS Smoke Test</h1>

      <div className="space-y-2 rounded-lg border p-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Email</label>
          <input
            className="h-10 rounded-md border px-3"
            value={email}
            onChange={handleEmailChange}
            placeholder="usera@test.com"
          />
          <label className="text-sm font-medium">Password</label>
          <input
            className="h-10 rounded-md border px-3"
            value={password}
            onChange={handlePasswordChange}
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
