import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { writeAuthCookies } from "@/lib/supabase/authCookies";

export function useLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(
    () => searchParams?.get("redirect") || "/dashboard",
    [searchParams]
  );

  const [email, setEmail] = useState("usera@test.com");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setStatus("Signing in…");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus(`Error: ${error.message}`);
        setSubmitting(false);
        return;
      }

      if (data?.session) {
        writeAuthCookies(data.session);
      }

      setStatus("Signed in!");
      router.replace(redirectTo);
    },
    [email, password, redirectTo, router]
  );

  return {
    email,
    password,
    status,
    submitting,
    redirectTo,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}
