import { redirect } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const email = data.user.email ?? null;

  return <DashboardClient email={email} />;
}
