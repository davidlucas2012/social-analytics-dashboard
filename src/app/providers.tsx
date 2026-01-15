"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useProviders } from "@/app/useProviders";

export default function Providers({ children }: { children: ReactNode }) {
  const { queryClient } = useProviders();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
