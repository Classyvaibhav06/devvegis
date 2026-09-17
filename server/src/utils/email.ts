import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from './logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_PORT === 465,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

/**
 * Universal email sender: uses Resend if RESEND_API_KEY is configured,
 * otherwise falls back to Nodemailer SMTP or dev logging.
 */
export async function sendEmail(options: EmailOptions): Promise<any> {
  // 1. Prioritize Resend when API key is set
  if (resend) {
    try {
      const res = await resend.emails.send({
        from: config.EMAIL_FROM || 'DevVegis <onboarding@resend.dev>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (res.error) {
        logger.error(`[Resend Error] Failed to send email to ${options.to}:`, res.error);
        // If Resend fails, allow falling back to nodemailer below if configured
      } else {
        logger.info(`[Resend] Successfully sent email to ${options.to} (ID: ${res.data?.id})`);
        return res.data;
      }
    } catch (err) {
      logger.error(`[Resend Exception] Failed to send to ${options.to}:`, err);
    }
  }

  // 2. Nodemailer SMTP fallback
  if (config.EMAIL_USER) {
    try {
      const info = await transporter.sendMail({
        from: config.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      logger.info(`[Nodemailer] Sent to ${options.to}: ${options.subject}`);
      return info;
    } catch (err) {
      logger.error(`[Nodemailer] Failed to send to ${options.to}:`, err);
    }
  }

  // 3. Dev preview fallback (so local testing never blocks without credentials)
  logger.warn(
    `[Email Mock] No active email service configured (RESEND_API_KEY or EMAIL_USER missing).
To: ${options.to}
Subject: ${options.subject}`
  );
  return { id: 'mock-email-dev' };
}

/**
 * Sends a branded Order Confirmation & Delivery OTP email via Resend
 */
export async function sendOrderOtpEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  otp: string;
  totalAmount: number;
  deliveryAddress?: string;
  items?: Array<{ name: string; quantity: number; price?: number }>;
}): Promise<any> {
  const { to, customerName, orderNumber, otp, totalAmount, deliveryAddress, items } = params;

  const itemsHtml = items && items.length > 0
    ? items.map(
        (it) => `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;">
              ${it.name}
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px; text-align: center;">
              ×${it.quantity}
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">
              ${it.price ? `₹${it.price * it.quantity}` : '—'}
            </td>
          </tr>`
      ).join('')
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your DevVegis Delivery OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="560px" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981, #059669); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🌿 DevVegis</h1>
              <p style="margin: 6px 0 0; color: #ecfdf5; font-size: 13px; font-weight: 500;">Farm-Fresh Produce in 10–15 Minutes</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 18px; font-weight: 700;">Hi ${customerName || 'Customer'},</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
                Your order <strong>#${orderNumber}</strong> has been confirmed and is being packed fresh at the hub!
              </p>

              <!-- OTP Box -->
              <div style="background-color: #f0fdf4; border: 2px dashed #10B981; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; color: #047857; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                  Your Secure Delivery OTP
                </span>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #065f46; text-indent: 12px; margin: 4px 0;">
                  ${otp}
                </div>
                <p style="margin: 10px 0 0; color: #059669; font-size: 12px; line-height: 1.4;">
                  🔒 Share this 4-digit code with your rider only upon receiving your delivery.
                </p>
              </div>

              <!-- Order Summary -->
              <div style="background-color: #f8fafc; border-radius: 14px; padding: 18px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Order Total:</td>
                    <td style="font-size: 16px; font-weight: 800; color: #0f172a; text-align: right; padding-bottom: 8px;">₹${totalAmount}</td>
                  </tr>
                  ${deliveryAddress ? `
                  <tr>
                    <td colspan="2" style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                      📍 <strong>Delivery Address:</strong><br>${deliveryAddress}
                    </td>
                  </tr>` : ''}
                </table>

                ${itemsHtml ? `
                <div style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                  <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Items Ordered:</span>
                  <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 6px;">
                    ${itemsHtml}
                  </table>
                </div>` : ''}
              </div>

              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center;">
                Need help with your delivery? Reply directly to this email or visit our Help Center.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © 2026 DevVegis Technologies Pvt Ltd. All rights reserved.<br>
                Instant fresh vegetables, fruits & kitchen essentials.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: `🌿 Delivery OTP: ${otp} for DevVegis Order #${orderNumber}`,
    html,
    text: `Hi ${customerName}, your DevVegis Order #${orderNumber} is confirmed! Your delivery OTP is: ${otp}. Total: ₹${totalAmount}. Please share this code with your rider only upon delivery.`,
  });
}
