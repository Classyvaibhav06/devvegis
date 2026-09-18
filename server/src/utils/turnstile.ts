import { config } from '../config/env';
import { logger } from './logger';

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
  errorCodes?: string[];
}

/**
 * Verifies a Cloudflare Turnstile token with Cloudflare's siteverify API.
 * @param token The token received from the client-side Turnstile widget
 * @param remoteIp The client's IP address (optional)
 */
export async function verifyTurnstileToken(
  token?: string,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  const secretKey = config.TURNSTILE_SECRET_KEY;

  if (!token) {
    if (config.NODE_ENV !== 'production') {
      logger.warn('[Turnstile] No token provided in development mode — allowing request through.');
      return { success: true };
    }
    return { success: false, error: 'Security verification (CAPTCHA) is required.' };
  }

  // Allow Cloudflare dummy always-pass testing tokens
  if (token === '1x00000000000000000000AA' || token === 'dummy_token_dev') {
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      logger.error(`[Turnstile] Siteverify HTTP error: ${res.status} ${res.statusText}`);
      return { success: false, error: `Cloudflare Turnstile verification failed with HTTP ${res.status}` };
    }

    const data: any = await res.json();

    if (!data.success) {
      logger.warn('[Turnstile] Verification failed:', data['error-codes']);
      return {
        success: false,
        error: 'Security challenge failed. Please verify you are human and try again.',
        errorCodes: data['error-codes'],
      };
    }

    return { success: true };
  } catch (err: any) {
    logger.error('[Turnstile] Error contacting Cloudflare:', err);
    if (config.NODE_ENV !== 'production') {
      logger.warn('[Turnstile] Dev mode: bypassing network error to Cloudflare.');
      return { success: true };
    }
    return { success: false, error: 'Could not contact bot verification service. Please try again.' };
  }
}
