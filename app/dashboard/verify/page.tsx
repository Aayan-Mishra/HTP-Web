import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import VerifyOrdersClient from "./verify-client";

export default async function VerifyOrdersPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Verify Pickup Orders
        </h1>
        <p className="text-gray-600">
          Enter customer pickup codes to view order details and mark as completed
        </p>
      </div>

      <div className="max-w-4xl">
        <VerifyOrdersClient />
      </div>
    </div>
  );
}

