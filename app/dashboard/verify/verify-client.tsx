"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, X, PenTool } from "lucide-react";
import { verifyPickupCode, completeOrder } from "./actions";
import { useToast } from "@/hooks/use-toast";
import SignaturePadComponent from "@/components/signature-pad";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VerifyOrdersClient() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyPickupCode(code.toUpperCase().trim());
      
      if (result.success && result.order) {
        setOrderDetails(result.order);
        setShowModal(true);
      } else {
        toast({
          title: "Order Not Found",
          description: result.error || "No order found with this pickup code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while verifying the code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSignature = () => {
    setShowSignature(true);
  };

  const handleSignatureSave = (signatureData: string) => {
    setSignature(signatureData);
    setShowSignature(false);
  };

  const handleComplete = async () => {
    if (!orderDetails) return;

    if (!signature) {
      toast({
        title: "Signature Required",
        description: "Please request customer signature before completing the order.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await completeOrder(orderDetails.id, signature);
      
      if (result.success) {
        toast({
          title: "Order Completed",
          description: "The order has been marked as completed with customer signature.",
        });
        setShowModal(false);
        setOrderDetails(null);
        setCode("");
        setSignature("");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to complete order.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while completing the order.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      processing: { color: "bg-blue-100 text-blue-800", label: "Processing" },
      ready: { color: "bg-green-100 text-green-800", label: "Ready for Pickup" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    
    const { color, label } = variants[status] || variants.pending;
    
    return (
      <Badge className={`${color} px-3 py-1`}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Verify Pickup Code</CardTitle>
          <CardDescription>
            Enter the customer's pickup code to view and complete their order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="pickupCode">Pickup Code</Label>
                <Input
                  id="pickupCode"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={10}
                  className="font-mono text-lg"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading || code.length < 4}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              The pickup code is displayed on the customer's order receipt
            </p>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Order Details</DialogTitle>
            <DialogDescription>
              Review the order information before completing
            </DialogDescription>
          </DialogHeader>

          {orderDetails && (
            <div className="space-y-6">
              {/* Pickup Code Display */}
              <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-4 text-center">
                <p className="text-sm text-teal-800 mb-1">Pickup Code</p>
                <p className="text-3xl font-bold font-mono text-teal-900">
                  {orderDetails.pickup_code}
                </p>
              </div>

              {/* Order Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                {getStatusBadge(orderDetails.status)}
              </div>

              {/* Customer Information */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{orderDetails.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{orderDetails.customer_phone}</p>
                  </div>
                  {orderDetails.customer_email && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{orderDetails.customer_email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Information */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medicine</span>
                    <span className="font-semibold">{orderDetails.medicine_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">{orderDetails.quantity} unit(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="font-medium">
                      {new Date(orderDetails.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {orderDetails.notes && (
                    <div>
                      <p className="text-gray-600 mb-1">Notes</p>
                      <p className="font-medium bg-gray-50 p-3 rounded">{orderDetails.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                {!signature && orderDetails.status !== "completed" && (
                  <Button
                    onClick={handleRequestSignature}
                    variant="outline"
                    className="w-full border-teal-200 hover:bg-teal-50"
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Request Customer Signature
                  </Button>
                )}

                {signature && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-green-800">✓ Signature Captured</p>
                      <Button
                        onClick={() => setSignature("")}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    <img 
                      src={signature} 
                      alt="Customer Signature" 
                      className="w-full h-24 object-contain bg-white border rounded"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleComplete}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={orderDetails.status === "completed" || !signature}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Order
                  </Button>
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Signature Modal */}
      <Dialog open={showSignature} onOpenChange={setShowSignature}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Signature</DialogTitle>
            <DialogDescription>
              Please ask the customer to sign below to confirm order pickup
            </DialogDescription>
          </DialogHeader>
          
          <SignaturePadComponent onSave={handleSignatureSave} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
