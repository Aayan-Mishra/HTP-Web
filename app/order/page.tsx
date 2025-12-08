import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderForm from "./order-form";

export default async function OrderPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in?redirect_url=/order");
  }

  const user = await currentUser();
  const supabase = await createClient();

  const primaryEmail = user?.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  // Check if customer profile exists
  let profile = null;
  if (primaryEmail) {
    const { data } = await (supabase as any)
      .from("customer_profiles")
      .select("*")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    profile = data;
  }

  // If no profile, redirect to setup
  if (!profile) {
    redirect("/profile/setup");
  }

  return <OrderForm profile={profile} />;
}
