"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Eye, Search } from "lucide-react";
import { completeOrder } from "../verify/actions";
import { useToast } from "@/hooks/use-toast";
import SignaturePadComponent from "@/components/signature-pad";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  id: string;
  pickup_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  medicine_name: string;
  quantity: number;
  status: string;
  notes: string | null;
  customer_signature: string | null;
  created_at: string;
  customer_profiles?: any;
}

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const { toast } = useToast();

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.customer_name.toLowerCase().includes(query) ||
      order.medicine_name.toLowerCase().includes(query) ||
      order.pickup_code.toLowerCase().includes(query) ||
      order.customer_phone.includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      processing: { color: "bg-blue-100 text-blue-800", label: "Processing" },
      ready: { color: "bg-green-100 text-green-800", label: "Ready" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    
    const { color, label } = variants[status] || variants.pending;
    return <Badge className={`${color} px-2 py-1 text-xs`}>{label}</Badge>;
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setSignature(order.customer_signature || "");
    setShowDetailsModal(true);
  };

  const handleRequestSignature = () => {
    setShowSignature(true);
  };

  const handleSignatureSave = (signatureData: string) => {
    setSignature(signatureData);
    setShowSignature(false);
  };

  const handleComplete = async () => {
    if (!selectedOrder) return;

    if (!signature) {
      toast({
        title: "Signature Required",
        description: "Please request customer signature before completing the order.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await completeOrder(selectedOrder.id, signature);
      
      if (result.success) {
        toast({
          title: "Order Completed",
          description: "The order has been marked as completed with customer signature.",
        });
        
        // Update local state
        setOrders(orders.map(o => 
          o.id === selectedOrder.id 
            ? { ...o, status: "completed", customer_signature: signature }
            : o
        ));
        
        setShowDetailsModal(false);
        setSelectedOrder(null);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">All Orders</CardTitle>
              <CardDescription>
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
              </CardDescription>
            </div>
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="font-mono font-semibold text-teal-600">
                        {order.pickup_code}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium">{order.medicine_name}</td>
                    <td className="px-4 py-4">{order.quantity}</td>
                    <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        onClick={() => handleViewDetails(order)}
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No orders found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Order Details</DialogTitle>
            <DialogDescription>
              Review and complete the order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-4 text-center">
                <p className="text-sm text-teal-800 mb-1">Pickup Code</p>
                <p className="text-3xl font-bold font-mono text-teal-900">
                  {selectedOrder.pickup_code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Medicine</p>
                  <p className="font-medium">{selectedOrder.medicine_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{selectedOrder.quantity} unit(s)</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.status !== "completed" && (
                <div className="space-y-3 pt-4 border-t">
                  {!signature && (
                    <Button
                      onClick={handleRequestSignature}
                      variant="outline"
                      className="w-full border-teal-200 hover:bg-teal-50"
                    >
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

                  <Button
                    onClick={handleComplete}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!signature}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Order
                  </Button>
                </div>
              )}

              {selectedOrder.customer_signature && selectedOrder.status === "completed" && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Customer Signature</p>
                  <img 
                    src={selectedOrder.customer_signature} 
                    alt="Customer Signature" 
                    className="w-full h-24 object-contain bg-white border rounded"
                  />
                </div>
              )}
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
