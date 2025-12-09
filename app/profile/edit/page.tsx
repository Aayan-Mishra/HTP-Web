import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateProfile, linkMembership } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const supabase = await createClient();

  const primaryEmail = user?.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  let profile = null;

  if (primaryEmail) {
    const { data } = await (supabase as any)
      .from("customer_profiles")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    profile = data;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/profile" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          <h1 className="text-4xl font-poppins font-bold text-gray-900 mb-8">
            Edit Profile
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createOrUpdateProfile} className="space-y-6">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={profile?.full_name || user?.fullName || ""}
                    required
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
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile?.phone || ""}
                    placeholder="+91-9876543210"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    defaultValue={profile?.address || ""}
                    placeholder="123 Main Street, City, State"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {!profile?.membership_id && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Link Membership</CardTitle>
                <CardDescription>
                  Already have a membership? Link it to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={async (formData: FormData) => {
                  'use server';
                  const membershipNumber = formData.get("membership_number") as string;
                  await linkMembership(membershipNumber);
                  redirect("/profile");
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="membership_number">Membership Number</Label>
                    <Input
                      id="membership_number"
                      name="membership_number"
                      placeholder="MEM001"
                      required
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full">
                    Link Membership
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
