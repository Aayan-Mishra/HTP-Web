import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { User, CreditCard, Package, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function ProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const supabase = await createClient();

  // Get or create customer profile
  const primaryEmail = user?.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  let profile: any = null;
  let membership: any = null;
  let orders: any[] = [];

  if (primaryEmail) {
    const { data: existingProfile } = await (supabase as any)
      .from("customer_profiles")
      .select("*, memberships(*)")
      .eq("clerk_user_id", userId)
      .single();

    profile = existingProfile;

    // Get linked membership if exists
    if (profile?.membership_id) {
      const { data: membershipData } = await (supabase as any)
        .from("memberships")
        .select("*")
        .eq("id", profile.membership_id)
        .single();
      
      membership = membershipData;
    }

    // Get user's orders
    const { data: ordersData } = await (supabase as any)
      .from("order_requests")
      .select("*")
      .eq("customer_profile_id", profile?.id)
      .order("created_at", { ascending: false })
      .limit(10);

    orders = ordersData || [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-poppins font-bold text-gray-900 mb-2">
              My Dashboard
            </h1>
            <p className="text-gray-600">Welcome back! Here&apos;s your account overview.</p>
          </div>

          {/* Order Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {orders.filter((o: any) => o.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Ready for Pickup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {orders.filter((o: any) => o.status === 'ready').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">
                  {orders.filter((o: any) => o.status === 'completed').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-teal-600" />
                      My Orders
                    </CardTitle>
                    <CardDescription>Track your medication orders</CardDescription>
                  </div>
                  <Link href="/order">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      New Order
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => {
                      const getStatusIcon = (status: string) => {
                        switch(status) {
                          case 'completed':
                            return <CheckCircle className="h-5 w-5 text-green-600" />;
                          case 'ready':
                            return <Package className="h-5 w-5 text-green-600" />;
                          case 'pending':
                            return <Clock className="h-5 w-5 text-yellow-600" />;
                          case 'cancelled':
                            return <XCircle className="h-5 w-5 text-red-600" />;
                          default:
                            return <Clock className="h-5 w-5 text-blue-600" />;
                        }
                      };

                      const getStatusBadge = (status: string) => {
                        const variants: Record<string, string> = {
                          pending: "bg-yellow-100 text-yellow-800",
                          processing: "bg-blue-100 text-blue-800",
                          ready: "bg-green-100 text-green-800",
                          completed: "bg-gray-100 text-gray-800",
                          cancelled: "bg-red-100 text-red-800",
                        };
                        
                        return variants[status] || variants.pending;
                      };

                      return (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(order.status)}
                              <div>
                                <p className="font-semibold text-gray-900">{order.medicine_name}</p>
                                <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                              </div>
                            </div>
                            <Badge className={`${getStatusBadge(order.status)} px-3 py-1`}>
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="bg-teal-50 border border-teal-200 rounded p-3 mb-2">
                            <p className="text-xs text-teal-800 mb-1">Pickup Code</p>
                            <p className="text-xl font-mono font-bold text-teal-900">{order.pickup_code}</p>
                          </div>

                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                            {order.status === 'ready' && (
                              <span className="text-green-600 font-medium">Ready for pickup!</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link href="/order">
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        Place Your First Order
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar - Profile & Membership */}
            <div className="space-y-6">
              {/* Membership Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-teal-600" />
                    Membership
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {membership ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-4 rounded-lg">
                        <div className="mb-3">
                          <p className="text-xs opacity-90">Tier</p>
                          <p className="text-xl font-bold uppercase">{membership.tier}</p>
                        </div>
                        <div className="mb-3">
                          <p className="text-xs opacity-90">Discount</p>
                          <p className="text-2xl font-bold">{membership.discount_percentage}%</p>
                        </div>
                        <div className="text-xs opacity-90 border-t border-white/20 pt-2">
                          Valid until {new Date(membership.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-600 mb-3">No active membership</p>
                      <Link href="/membership">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                          Get Membership
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-teal-600" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="font-medium text-sm">{profile?.full_name || user?.fullName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-medium text-sm">{primaryEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="font-medium text-sm">{profile?.phone || "Not set"}</p>
                  </div>
                  <Link href="/profile/edit">
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
