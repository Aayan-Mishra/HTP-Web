import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-config";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check Clerk authentication
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Get Clerk user details
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const adminAccess = isAdmin(userId);

  // Check if user is a doctor
  const supabase = await createClient();
  const { data: doctorProfile } = await supabase
    .from("doctors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  const isDoctorUser = !!doctorProfile;

  // Extract only serializable user data for Client Components
  const userData = {
    fullName: user.fullName,
    email: user.emailAddresses[0]?.emailAddress || "",
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar isAdmin={adminAccess} isDoctor={isDoctorUser} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader user={userData} isAdmin={adminAccess} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

