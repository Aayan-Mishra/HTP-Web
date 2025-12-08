import { forwardRef } from "react";
import { Building2, User, Pill, Calendar, Hash } from "lucide-react";

interface PickupReceiptProps {
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

const PickupReceipt = forwardRef<HTMLDivElement, PickupReceiptProps>(
  ({ order, membership }, ref) => {
    return (
      <div ref={ref} className="bg-white p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b-4 border-teal-600 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 bg-teal-600 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-teal-900">Hometown Pharmacy</h1>
                <p className="text-gray-600">Your Trusted Healthcare Partner</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Receipt</p>
              <p className="text-xs text-gray-500">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Pickup Code - Large and Prominent */}
        <div className="bg-teal-50 border-4 border-teal-600 rounded-lg p-8 mb-6 text-center">
          <p className="text-sm font-semibold text-teal-800 mb-2">PICKUP CODE</p>
          <p className="text-6xl font-bold font-mono text-teal-900 tracking-wider">
            {order.pickup_code}
          </p>
          <p className="text-xs text-teal-600 mt-3">
            Present this code to our staff when collecting your order
          </p>
        </div>

        {/* Order Details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-teal-600" />
            Order Details
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600">Medicine</span>
              <span className="font-semibold">{order.medicine_name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600">Quantity</span>
              <span className="font-semibold">{order.quantity} unit(s)</span>
            </div>
            {order.notes && (
              <div className="pt-2">
                <p className="text-gray-600 text-sm mb-1">Notes:</p>
                <p className="text-gray-800 text-sm">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-teal-600" />
            Customer Information
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name</span>
              <span className="font-semibold">{order.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone</span>
              <span className="font-semibold">{order.customer_phone}</span>
            </div>
            {membership && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-600">Membership</span>
                <span className="font-semibold px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                  {membership.tier.toUpperCase()} ({membership.discount_percentage}% OFF)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Important Information</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Please bring this receipt when collecting your order</li>
            <li>• Bring a valid ID for verification</li>
            <li>• If the medicine requires a prescription, please bring it with you</li>
            <li>• Orders can be collected during business hours: 9 AM - 8 PM</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">Thank you for choosing Hometown Pharmacy</p>
          <p className="text-xs text-gray-500 mt-1">
            For assistance, please call us or visit our store
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <span>📍 123 Main Street, Your City</span>
            <span>📞 +91-1234567890</span>
          </div>
        </div>
      </div>
    );
  }
);

PickupReceipt.displayName = "PickupReceipt";

export default PickupReceipt;
