import type { Session } from "@supabase/supabase-js";

function secureFlag() {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureFlag()}`;
}

export function writeAuthCookies(session: Session) {
  const access = session?.access_token;
  const refresh = session?.refresh_token;

  if (access) {
    const maxAge = session.expires_in ?? 60 * 60; // default 1h
    setCookie("sb-access-token", access, maxAge);
  }

  if (refresh) {
    const refreshMaxAge = 60 * 60 * 24 * 7; // 7 days
    setCookie("sb-refresh-token", refresh, refreshMaxAge);
  }
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie =
    "sb-access-token=; Path=/; Max-Age=0; SameSite=Lax" + secureFlag();
  document.cookie =
    "sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax" + secureFlag();
}
