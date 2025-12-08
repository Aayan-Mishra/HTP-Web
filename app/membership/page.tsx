"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { lookupMembership, renewMembership } from "./actions";
import { formatDate } from "@/lib/utils";

type Membership = {
  id: string;
  customer_name: string;
  customer_phone: string;
  membership_number: string;
  status: "active" | "expired" | "cancelled";
  start_date: string;
  end_date: string;
  discount_percentage: number;
};

export default function MembershipPage() {
  const [phone, setPhone] = useState("");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [renewing, setRenewing] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);

    try {
      const result = await lookupMembership(phone);
      if (result) {
        setMembership(result);
      } else {
        setNotFound(true);
        setMembership(null);
      }
    } catch (error) {
      console.error("Lookup error:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!membership) return;

    setRenewing(true);
    try {
      const result = await renewMembership(membership.id);
      if (result.success && result.membership) {
        setMembership(result.membership);
      }
    } catch (error) {
      console.error("Renewal error:", error);
    } finally {
      setRenewing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Hometown Pharmacy</span>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Membership Lookup</CardTitle>
            <CardDescription>
              Enter your phone number to check your membership status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="phone" className="sr-only">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Lookup"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {membership && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{membership.customer_name}</CardTitle>
                  <CardDescription className="text-lg mt-1">
                    Member #{membership.membership_number}
                  </CardDescription>
                </div>
                <div>
                  {membership.status === "active" ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-6 w-6 mr-2" />
                      <span className="font-semibold">Active</span>
                    </div>
                  ) : membership.status === "expired" ? (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      <span className="font-semibold">Expired</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-6 w-6 mr-2" />
                      <span className="font-semibold">Cancelled</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{formatDate(membership.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">{formatDate(membership.end_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount</p>
                  <p className="font-medium text-primary">{membership.discount_percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{membership.customer_phone}</p>
                </div>
              </div>

              {membership.status === "expired" && (
                <div className="pt-4 border-t">
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
                    <p className="text-sm text-orange-800">
                      Your membership has expired. Renew now to continue enjoying exclusive discounts!
                    </p>
                  </div>
                  <Button onClick={handleRenew} disabled={renewing} className="w-full">
                    {renewing ? "Processing..." : "Renew Membership"}
                  </Button>
                </div>
              )}

              {membership.status === "active" && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-800">
                    Your membership is active! Enjoy {membership.discount_percentage}% discount on all purchases.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {notFound && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Membership Found
              </h3>
              <p className="text-gray-500 mb-4">
                No active membership found with this phone number.
              </p>
              <p className="text-sm text-gray-600">
                Visit our pharmacy to register for a new membership and start enjoying exclusive benefits!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
