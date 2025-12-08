import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-config";
import { createClient } from "@/lib/supabase/server";
import OrdersTable from "./orders-table";

export default async function OrdersPage() {
  const { userId } = await auth();
  
  if (!userId || !isAdmin(userId)) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Get all orders with customer profile info
  const { data: orders } = await (supabase as any)
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
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Management
        </h1>
        <p className="text-gray-600">
          View and manage all customer orders
        </p>
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  );
}
