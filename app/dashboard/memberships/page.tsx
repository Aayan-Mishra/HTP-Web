import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-config";
import MembershipsClient from "./memberships-client";

export default async function MembershipsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  if (!isAdmin(userId)) {
    redirect("/");
  }

  const supabase = await createClient();

  // Fetch all membership tiers
  const { data: tiers } = await supabase
    .from("membership_tiers")
    .select("*")
    .order("points_threshold");

  // Fetch all memberships with customer info
  const { data: memberships } = await supabase
    .from("customer_memberships")
    .select(`
      *,
      membership_tiers(name, tier_level, benefits),
      customer_profiles(full_name, email)
    `)
    .order("created_at", { ascending: false });

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("membership_transactions")
    .select(`
      *,
      customer_memberships(membership_code, customer_profiles(full_name))
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <MembershipsClient
      tiers={tiers || []}
      memberships={memberships || []}
      transactions={transactions || []}
    />
  );
}
