import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateProfile } from "../actions";
import { Building2 } from "lucide-react";

export default async function ProfileSetupPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const supabase = await createClient();

  const primaryEmail = user?.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  // Check if profile already exists
  if (primaryEmail) {
    const { data: profile } = await (supabase as any)
      .from("customer_profiles")
      .select("*")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profile) {
      redirect("/profile");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-teal-600 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-poppins font-bold text-gray-900 mb-2">
            Welcome to Hometown Pharmacy
          </h1>
          <p className="text-gray-600">
            Let's set up your profile to get started with ordering medications
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              This information will be used for order processing and delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createOrUpdateProfile} className="space-y-6">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={user?.fullName || ""}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={primaryEmail || ""}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">This email is from your account</p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91-9876543210"
                />
                <p className="text-xs text-gray-500 mt-1">Required for order updates</p>
              </div>

              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  required
                  placeholder="123 Main Street, Apartment 4B, City, State, PIN"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">We'll deliver your medications here</p>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h3 className="font-semibold text-teal-900 mb-2">Next Steps</h3>
                <ul className="text-sm text-teal-800 space-y-1">
                  <li>• Complete this profile to place orders</li>
                  <li>• Link your membership later for exclusive discounts</li>
                  <li>• Upload prescriptions when ordering prescription medications</li>
                </ul>
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                Complete Setup & Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
