/**
 * Email Service Wrapper
 * 
 * This service provides email notification functionality.
 * Currently using mock implementation.
 * 
 * To integrate a real provider (e.g., SendGrid, Resend):
 * 1. Add API keys to .env
 * 2. Install provider SDK
 * 3. Implement provider-specific methods
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  /**
   * Send email notification
   * TODO: integrate real API when provider is configured
   */
  async send(payload: EmailPayload): Promise<EmailResponse> {
    // Mock implementation
    console.log(`[MOCK EMAIL] To: ${payload.to}, Subject: ${payload.subject}`);
    
    return {
      success: true,
      messageId: `mock_email_${Date.now()}`,
    };

    // TODO: Implement real provider
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const { data, error } = await resend.emails.send({
    //   from: "Hometown Pharmacy <noreply@hometownpharmacy.com>",
    //   to: payload.to,
    //   subject: payload.subject,
    //   html: payload.html,
    // });
    // 
    // if (error) {
    //   return { success: false, error: error.message };
    // }
    // 
    // return { success: true, messageId: data?.id };
  }
}

export const emailService = new EmailService();

// Email templates
export const EmailTemplates = {
  orderConfirmation: (customerName: string, medicineName: string, quantity: number) => ({
    subject: "Order Confirmation - Hometown Pharmacy",
    html: `
      <h1>Order Confirmed!</h1>
      <p>Dear ${customerName},</p>
      <p>We've received your order request:</p>
      <ul>
        <li><strong>Medicine:</strong> ${medicineName}</li>
        <li><strong>Quantity:</strong> ${quantity}</li>
      </ul>
      <p>We'll notify you when your order is ready for pickup.</p>
      <p>Thank you for choosing Hometown Pharmacy!</p>
    `,
    text: `Order Confirmed! Dear ${customerName}, We've received your order for ${quantity} units of ${medicineName}. We'll notify you when it's ready.`,
  }),

  membershipReceipt: (customerName: string, membershipNumber: string, endDate: string) => ({
    subject: "Membership Renewal Receipt - Hometown Pharmacy",
    html: `
      <h1>Membership Renewed!</h1>
      <p>Dear ${customerName},</p>
      <p>Your Hometown Pharmacy membership has been successfully renewed.</p>
      <ul>
        <li><strong>Membership Number:</strong> ${membershipNumber}</li>
        <li><strong>Valid Until:</strong> ${endDate}</li>
      </ul>
      <p>Continue enjoying exclusive discounts on all your purchases!</p>
    `,
    text: `Membership Renewed! Dear ${customerName}, Your membership #${membershipNumber} is now valid until ${endDate}.`,
  }),
};
