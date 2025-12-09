"use server";

import { createClient } from "@/lib/supabase/server";

export async function lookupMembership(phone: string) {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("memberships")
    .select("*")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Membership lookup error:", error);
    return null;
  }

  return data;
}

export async function renewMembership(membershipId: string) {
  const supabase = await createClient();

  // Calculate new end date (1 year from now)
  const newEndDate = new Date();
  newEndDate.setFullYear(newEndDate.getFullYear() + 1);

  const updateData: any = {
    status: "active",
    start_date: new Date().toISOString().split("T")[0],
    end_date: newEndDate.toISOString().split("T")[0],
  };

  const { data, error } = await (supabase as any)
    .from("memberships")
    .update(updateData)
    .eq("id", membershipId)
    .select()
    .single();

  if (error) {
    console.error("Membership renewal error:", error);
    return { success: false, error: error.message };
  }

  // TODO: Trigger Edge Function to send renewal receipt via SMS
  // await sendRenewalReceipt(data.customer_phone, data.membership_number);

  return { success: true, membership: data };
}
