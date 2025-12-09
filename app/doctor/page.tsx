import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import DoctorDashboardClient from "./doctor-dashboard-client";

export default async function DoctorDashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  // Check if user is a doctor
  const { data: doctor } = await (supabase as any)
    .from("doctors")
    .select("*")
    .eq("clerk_user_id", user.id)
    .single();

  if (!doctor) {
    redirect("/dashboard");
  }

  // Get doctor's patients with latest prescription info
  const { data: patients } = await (supabase as any)
    .from("patients")
    .select(`
      *,
      prescriptions (
        id,
        prescription_number,
        created_at,
        status
      )
    `)
    .eq("assigned_doctor_id", doctor.id)
    .order("created_at", { ascending: false });

  return (
    <DoctorDashboardClient
      doctor={doctor}
      patients={patients || []}
    />
  );
}
