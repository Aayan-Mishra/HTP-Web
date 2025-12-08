"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pill, ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { submitOrder } from "./actions";
import { useToast } from "@/hooks/use-toast";

interface OrderFormProps {
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export default function OrderForm({ profile }: OrderFormProps) {
  const searchParams = useSearchParams();
  const medicineName = searchParams.get("medicine") || "";
  
  const [formData, setFormData] = useState({
    medicineName: medicineName,
    quantity: "1",
    notes: "",
    requiresPrescription: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pickupCode, setPickupCode] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await submitOrder({
        customer_profile_id: profile.id,
        medicine_name: formData.medicineName,
        quantity: parseInt(formData.quantity),
        notes: formData.notes,
      });
      
      if (result.success) {
        setSuccess(true);
        setPickupCode(result.pickupCode || "");
        toast({
          title: "Order Submitted!",
          description: "We'll notify you when your order is ready for pickup.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit order. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <nav className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pill className="h-8 w-8 text-teal-600" />
              <span className="text-2xl font-poppins font-bold text-teal-900">Hometown Pharmacy</span>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center border-teal-200">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-20 w-20 text-green-500" />
              </div>
              <CardTitle className="text-3xl text-teal-900">Order Submitted Successfully!</CardTitle>
              <CardDescription className="text-lg mt-2">
                We've received your order request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Our staff will process your order and notify you when it's ready for pickup.
              </p>
              
              {pickupCode && (
                <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-6">
                  <p className="text-sm text-teal-800 mb-2">Your Pickup Code</p>
                  <p className="text-4xl font-bold font-mono text-teal-900">{pickupCode}</p>
                  <p className="text-xs text-teal-600 mt-2">
                    Show this code when collecting your order
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Order Details:</strong> {formData.quantity} unit(s) of {formData.medicineName}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Delivery to:</strong> {profile.address}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/profile" className="flex-1">
                  <Button variant="outline" className="w-full">View My Orders</Button>
                </Link>
                <Link href="/search" className="flex-1">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">Order More</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-poppins font-bold text-teal-900">Hometown Pharmacy</span>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-teal-900">Place Order Request</CardTitle>
                <CardDescription>
                  Fill in the details below and we'll prepare your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="medicineName">Medicine Name *</Label>
                    <Input
                      id="medicineName"
                      type="text"
                      required
                      value={formData.medicineName}
                      onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                      placeholder="Enter medicine name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special instructions or requirements..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requiresPrescription"
                      checked={formData.requiresPrescription}
                      onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                      className="h-4 w-4 text-teal-600"
                    />
                    <Label htmlFor="requiresPrescription" className="font-normal cursor-pointer">
                      This medicine requires a prescription
                    </Label>
                  </div>

                  {formData.requiresPrescription && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Prescription Required:</strong> Please bring your prescription when collecting your order.
                      </p>
                      <Button type="button" variant="outline" size="sm" className="mt-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Prescription (Optional)
                      </Button>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Order Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit Information
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
