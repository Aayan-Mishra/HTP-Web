/**
 * Supabase Edge Function: Send Order Ready Message
 * 
 * Notifies customer when their order is ready for pickup.
 * 
 * Deploy command:
 * supabase functions deploy send-order-ready-message
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface OrderReadyPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  medicineName: string;
  quantity: number;
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload: OrderReadyPayload = await req.json();

    if (!payload.customerName || !payload.customerPhone || !payload.medicineName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // TODO: Send SMS notification
    const smsMessage = `Hi ${payload.customerName}, your order for ${payload.medicineName} is ready for pickup at Hometown Pharmacy. Thank you!`;
    
    console.log(`[MOCK SMS] To: ${payload.customerPhone}, Message: ${smsMessage}`);

    // TODO: Send email notification if provided
    if (payload.customerEmail) {
      console.log(`[MOCK EMAIL] To: ${payload.customerEmail}, Order ready notification`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order ready notification sent successfully (mock)",
        sentTo: {
          sms: payload.customerPhone,
          email: payload.customerEmail || null,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending order notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
