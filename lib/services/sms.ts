/**
 * SMS Service Wrapper
 * 
 * This service provides a unified interface for sending SMS notifications.
 * Currently using mock implementation. To integrate a real provider:
 * 
 * 1. Add provider API keys to .env
 * 2. Install provider SDK (e.g., npm install twilio)
 * 3. Uncomment and implement the provider-specific code below
 * 4. Remove mock implementation
 */

export type SMSProvider = "twilio" | "msg91" | "mock";

export interface SMSConfig {
  provider: SMSProvider;
  apiKey?: string;
  senderId?: string;
}

export interface SMSPayload {
  to: string;
  message: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  /**
   * Send SMS notification
   * TODO: integrate real API when provider is configured
   */
  async send(payload: SMSPayload): Promise<SMSResponse> {
    // Validate phone number format
    if (!this.validatePhoneNumber(payload.to)) {
      return {
        success: false,
        error: "Invalid phone number format",
      };
    }

    // Mock implementation (replace with real provider)
    return this.sendMock(payload);

    // Uncomment and use real provider when ready:
    // switch (this.config.provider) {
    //   case "twilio":
    //     return this.sendTwilio(payload);
    //   case "msg91":
    //     return this.sendMSG91(payload);
    //   default:
    //     return this.sendMock(payload);
    // }
  }

  private validatePhoneNumber(phone: string): boolean {
    // Basic validation for Indian phone numbers
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  /**
   * Mock SMS implementation
   * Returns success without actually sending SMS
   */
  private async sendMock(payload: SMSPayload): Promise<SMSResponse> {
    console.log(`[MOCK SMS] To: ${payload.to}, Message: ${payload.message}`);
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  /**
   * Twilio SMS implementation
   * TODO: Uncomment and configure when Twilio is set up
   */
  // private async sendTwilio(payload: SMSPayload): Promise<SMSResponse> {
  //   try {
  //     const twilio = require("twilio");
  //     const client = twilio(
  //       process.env.TWILIO_ACCOUNT_SID,
  //       process.env.TWILIO_AUTH_TOKEN
  //     );
  //
  //     const message = await client.messages.create({
  //       body: payload.message,
  //       from: this.config.senderId || process.env.TWILIO_PHONE_NUMBER,
  //       to: payload.to,
  //     });
  //
  //     return {
  //       success: true,
  //       messageId: message.sid,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // }

  /**
   * MSG91 SMS implementation
   * TODO: Uncomment and configure when MSG91 is set up
   */
  // private async sendMSG91(payload: SMSPayload): Promise<SMSResponse> {
  //   try {
  //     const response = await fetch("https://api.msg91.com/api/v5/flow/", {
  //       method: "POST",
  //       headers: {
  //         "authkey": this.config.apiKey || process.env.MSG91_API_KEY!,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         sender: this.config.senderId || process.env.MSG91_SENDER_ID,
  //         mobiles: payload.to,
  //         message: payload.message,
  //       }),
  //     });
  //
  //     const data = await response.json();
  //
  //     if (data.type === "success") {
  //       return {
  //         success: true,
  //         messageId: data.message,
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         error: data.message,
  //       };
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // }
}

// Export configured instance
export const smsService = new SMSService({
  provider: "mock", // Change to "twilio" or "msg91" when ready
  // apiKey: process.env.SMS_PROVIDER_API_KEY,
  // senderId: process.env.SMS_PROVIDER_SENDER_ID,
});

// Helper functions for common SMS templates
export const SMSTemplates = {
  orderReady: (customerName: string, medicineName: string) =>
    `Hi ${customerName}, your order for ${medicineName} is ready for pickup at Hometown Pharmacy. Thank you!`,

  orderApproved: (customerName: string, medicineName: string) =>
    `Hi ${customerName}, your order request for ${medicineName} has been approved. We'll notify you when it's ready.`,

  membershipRenewal: (customerName: string, membershipNumber: string, endDate: string) =>
    `Hi ${customerName}, your Hometown Pharmacy membership #${membershipNumber} has been renewed until ${endDate}. Enjoy exclusive discounts!`,

  membershipExpiring: (customerName: string, daysLeft: number) =>
    `Hi ${customerName}, your Hometown Pharmacy membership expires in ${daysLeft} days. Visit us to renew!`,

  lowStockAlert: (medicineName: string, quantity: number) =>
    `[STAFF ALERT] Low stock: ${medicineName} - Only ${quantity} units remaining. Please restock.`,
};
