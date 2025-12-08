'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrUpdateProfile(formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const primaryEmail = user?.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    throw new Error("No email found");
  }

  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const supabase = await createClient();

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  const profileData = {
    full_name,
    phone,
    address,
  };

  if (existingProfile) {
    // Update existing profile
    const { error } = await (supabase as any)
      .from("customer_profiles")
      .update(profileData)
      .eq("clerk_user_id", userId);

    if (error) throw error;
  } else {
    // Create new profile
    const { error } = await (supabase as any)
      .from("customer_profiles")
      .insert({
        clerk_user_id: userId,
        email: primaryEmail,
        ...profileData,
      });

    if (error) throw error;
  }

  revalidatePath("/profile");
  redirect("/profile");
}

export async function linkMembership(membershipNumber: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const supabase = await createClient();

  // Get customer profile
  const { data: profile } = await (supabase as any)
    .from("customer_profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) {
    throw new Error("Profile not found. Please create your profile first.");
  }

  // Find membership by number
  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("*")
    .eq("membership_number", membershipNumber.toUpperCase())
    .single();

  if (membershipError || !membership) {
    throw new Error("Membership not found");
  }

  // Check if membership matches profile email or phone
  if (membership.customer_email !== profile.email && membership.customer_phone !== profile.phone) {
    throw new Error("Membership does not match your email or phone number");
  }

  // Link membership to profile
  const { error } = await (supabase as any)
    .from("customer_profiles")
    .update({ membership_id: membership.id })
    .eq("clerk_user_id", userId);

  if (error) throw error;

  revalidatePath("/profile");
}
