/**
 * Supabase Edge Function: Send Membership Renewal Receipt
 * 
 * Sends receipt via SMS/Email when membership is renewed.
 * 
 * Deploy command:
 * supabase functions deploy send-membership-renewal-receipt
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface RenewalPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  membershipNumber: string;
  endDate: string;
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

    const payload: RenewalPayload = await req.json();

    // Validate
    if (!payload.customerName || !payload.customerPhone || !payload.membershipNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // TODO: Send SMS receipt
    const smsMessage = `Hi ${payload.customerName}, your Hometown Pharmacy membership #${payload.membershipNumber} has been renewed until ${payload.endDate}. Enjoy exclusive discounts!`;
    
    console.log(`[MOCK SMS] To: ${payload.customerPhone}, Message: ${smsMessage}`);

    // TODO: Send email receipt if email provided
    if (payload.customerEmail) {
      console.log(`[MOCK EMAIL] To: ${payload.customerEmail}, Membership renewal receipt`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Renewal receipt sent successfully (mock)",
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
    console.error("Error sending renewal receipt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
