"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyPickupCode(pickupCode: string) {
  const supabase = await createClient();

  const { data: order, error } = await (supabase as any)
    .from("order_requests")
    .select(`
      *,
      customer_profiles (
        full_name,
        email,
        phone,
        memberships (
          tier,
          discount_percentage
        )
      )
    `)
    .eq("pickup_code", pickupCode)
    .single();

  if (error || !order) {
    return { success: false, error: "Order not found with this pickup code" };
  }

  return { success: true, order };
}

export async function completeOrder(orderId: string, signature?: string) {
  const supabase = await createClient();

  const updateData: any = { 
    status: "completed",
    updated_at: new Date().toISOString()
  };

  // Add signature if provided
  if (signature) {
    updateData.customer_signature = signature;
  }

  const { error } = await (supabase as any)
    .from("order_requests")
    .update(updateData)
    .eq("id", orderId);

  if (error) {
    console.error("Error completing order:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/verify");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { success: true };
}
