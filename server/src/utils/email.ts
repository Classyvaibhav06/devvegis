import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_PORT === 465,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!config.EMAIL_USER) {
    logger.warn('[Email] Email not configured, skipping send.');
    return;
  }
  try {
    await transporter.sendMail({
      from: config.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info(`[Email] Sent to ${options.to}: ${options.subject}`);
  } catch (err) {
    logger.error(`[Email] Failed to send to ${options.to}:`, err);
    throw err;
  }
}
