import { useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { clearAuthCookies, writeAuthCookies } from "@/lib/supabase/authCookies";

export function useProviders() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        writeAuthCookies(session);
      } else {
        clearAuthCookies();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { queryClient };
}
