import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-config";
import ClinicClient from "./clinic-client";

export default async function ClinicPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  if (!isAdmin(userId)) {
    redirect("/");
  }

  const supabase = await createClient();

  // Fetch all doctors
  const { data: doctors } = await supabase
    .from("doctors")
    .select("*")
    .order("full_name");

  // Fetch all patients with doctor info
  const { data: patients } = await supabase
    .from("patients")
    .select(`
      *,
      doctors(full_name, specialization)
    `)
    .order("created_at", { ascending: false });

  // Fetch recent prescriptions
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(`
      *,
      patients(patient_code, full_name),
      doctors(full_name, license_number)
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <ClinicClient
      doctors={doctors || []}
      patients={patients || []}
      prescriptions={prescriptions || []}
    />
  );
}
