import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ClipboardList, Users, ShieldAlert, ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/admin-config";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const adminAccess = isAdmin(userId);
  
  if (!adminAccess) {
    // Regular users don't have access to admin dashboard
    return (
      <div className="min-h-full bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Access Restricted</CardTitle>
            <CardDescription className="text-base mt-2">
              This area is reserved for staff members only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              You can access your personal profile and order medications from the main site.
            </p>
            <div className="flex gap-3">
              <Link href="/profile" className="flex-1">
                <Button variant="outline" className="w-full">
                  My Profile
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();

  // Get dashboard stats
  const [
    { count: pendingOrders },
    { count: lowStockItems },
    { count: activeMemberships },
    { data: expiringBatches },
  ] = await Promise.all([
    (supabase as any).from("order_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    (supabase as any).from("low_stock_view").select("*", { count: "exact", head: true }),
    (supabase as any).from("memberships").select("*", { count: "exact", head: true }).eq("status", "active"),
    (supabase as any).from("expiry_alerts").select("*").limit(5),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems || 0}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMemberships || 0}</div>
              <p className="text-xs text-muted-foreground">Current memberships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {expiringBatches?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Batches expiring soon</p>
            </CardContent>
          </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/orders">
            <Button className="w-full" variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Process Orders
            </Button>
          </Link>
          {adminAccess && (
            <>
              <Link href="/dashboard/inventory">
                <Button className="w-full" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Inventory
                </Button>
              </Link>
              <Link href="/dashboard/memberships">
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      {/* Expiry Alerts */}
      {expiringBatches && expiringBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expiry Alerts</CardTitle>
            <CardDescription>Medicines expiring within 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringBatches.map((batch: any) => (
                <div
                  key={batch.batch_id}
                  className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-md"
                >
                  <div>
                    <p className="font-medium">{batch.medicine_name}</p>
                    <p className="text-sm text-gray-600">
                      Batch #{batch.batch_number} • {batch.quantity} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {batch.days_until_expiry} days left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
