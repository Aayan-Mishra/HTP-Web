import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-config";
import { createClient } from "@/lib/supabase/server";
import InventoryClient from "./inventory-client";

export default async function InventoryPage() {
  const { userId } = await auth();
  
  if (!userId || !isAdmin(userId)) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Get all products
  const { data: products } = await (supabase as any)
    .from("products")
    .select("*")
    .order("name");

  // Get low stock products
  const { data: lowStockProducts } = await (supabase as any)
    .from("low_stock_products")
    .select("*");

  // Get expiring products
  const { data: expiringProducts } = await (supabase as any)
    .from("expiring_products")
    .select("*");

  return (
    <InventoryClient 
      products={products || []} 
      lowStockProducts={lowStockProducts || []}
      expiringProducts={expiringProducts || []}
    />
  );
}
