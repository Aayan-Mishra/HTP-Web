"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import PickupReceipt from "@/components/pickup-receipt";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OrderReceiptButtonProps {
  order: {
    id: string;
    pickup_code: string;
    customer_name: string;
    customer_phone: string;
    medicine_name: string;
    quantity: number;
    notes?: string;
    created_at: string;
  };
  membership?: {
    tier: string;
    discount_percentage: number;
  } | null;
}

export default function OrderReceiptButton({ order, membership }: OrderReceiptButtonProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Order-Receipt-${order.pickup_code}`,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          View Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pickup Receipt</DialogTitle>
          <DialogDescription>
            Present this receipt when collecting your order
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <PickupReceipt ref={receiptRef} order={order} membership={membership} />
        </div>

        <div className="flex gap-3 mt-4 pt-4 border-t">
          <Button onClick={handlePrint} className="flex-1 bg-teal-600 hover:bg-teal-700">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
