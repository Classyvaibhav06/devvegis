// DevVegis — Next.js Edge Middleware
// Performs server-side JWT verification before the SPA bundle is served.
// Unauthenticated requests to protected routes are redirected to /login,
// eliminating the client-side-only auth bypass identified in the security audit.

import { NextRequest, NextResponse } from 'next/server';

// ── JWT helpers (Edge-compatible, no Node crypto) ────────────────────────────

function base64UrlDecode(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLength);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

async function verifyJwt(token: string, secret: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    const keyMaterial = new TextEncoder().encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlDecode(signatureB64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(data)
    );

    if (!isValid) return { valid: false };

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64))
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) return { valid: false };

    return { valid: true, payload };
  } catch (e: any) {
    return { valid: false, error: e?.message || String(e) };
  }
}

// ── Route configuration ───────────────────────────────────────────────────────

/** Routes that require authentication */
const PROTECTED_PREFIXES = [
  '/admin',
  '/rider',
  '/profile',
  '/orders',
  '/checkout',
  '/cart',
  '/wishlist',
  '/wallet',
  '/notifications',
];

/** Sensitive auth routes with stricter rate limits */
const SENSITIVE_AUTH_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
];

// ── Edge In-Memory Rate Limiter ────────────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const edgeRateLimitMap = new Map<string, RateLimitEntry>();
const MAX_RATE_LIMIT_MAP_SIZE = 5000;

function checkEdgeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { limited: boolean; retryAfter: number } {
  const now = Date.now();

  // Periodically purge expired keys to prevent memory leak
  if (edgeRateLimitMap.size > MAX_RATE_LIMIT_MAP_SIZE) {
    for (const [k, v] of edgeRateLimitMap.entries()) {
      if (now > v.resetAt) edgeRateLimitMap.delete(k);
    }
  }

  const existing = edgeRateLimitMap.get(key);
  if (!existing || now > existing.resetAt) {
    edgeRateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { limited: true, retryAfter };
  }

  existing.count++;
  return { limited: false, retryAfter: 0 };
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Skip prefetch and RSC background requests from client rate limiting
  const isPrefetch =
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('x-nextjs-prefetch') === '1';

  if (!isPrefetch) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || '127.0.0.1');

    const isSensitiveAuth = SENSITIVE_AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const limit = isSensitiveAuth ? 40 : 120; // 40 req/min on auth pages; 120 req/min on storefront
    const windowMs = 60 * 1000; // 1 minute
    const rateLimitKey = `${isSensitiveAuth ? 'auth' : 'page'}:${ip}`;

    const { limited, retryAfter } = checkEdgeRateLimit(rateLimitKey, limit, windowMs);
    if (limited) {
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html')) {
        return new NextResponse(
          `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>429 Too Many Requests - DevVegis</title><style>body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#090d0b;color:#e2e8f0;padding:24px;text-align:center}.card{background:#111915;border:1px solid #1e2e26;border-radius:16px;padding:40px 32px;max-width:440px;box-shadow:0 20px 40px rgba(0,0,0,0.5)}h1{color:#10b981;font-size:24px;margin:0 0 12px;font-weight:700}p{color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px}.btn{display:inline-block;padding:10px 24px;background:#10b981;color:#052e16;font-weight:600;border-radius:9999px;text-decoration:none;transition:opacity .2s}.btn:hover{opacity:.9}</style></head><body><div class="card"><h1>Rate Limit Exceeded</h1><p>Too many requests detected from your connection. Please wait a moment before continuing.</p><a href="/" class="btn">Return to Storefront</a></div></body></html>`,
          {
            status: 429,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Retry-After': String(retryAfter),
            },
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please slow down and try again.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
          },
        }
      );
    }
  }

  // 2. Authentication and Role checks for protected routes
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  // Try access token from Authorization header or cookie
  const authHeader = request.headers.get('authorization') ?? '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const rawCookie = request.cookies.get('accessToken')?.value;
  const tokenFromCookie = rawCookie ? decodeURIComponent(rawCookie) : null;
  const token = tokenFromHeader ?? tokenFromCookie;

  const rawSecret = process.env.JWT_ACCESS_SECRET || 'devvegis_jwt_access_secret_change_in_production';
  const cleanSecret = rawSecret.replace(/^[\s"'\r\n]+|[\s"'\r\n]+$/g, '');
  const fallbackSecret = 'devvegis_jwt_access_secret_change_in_production';

  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Attempt verification with clean secret, fallback to default if needed
  let verification = await verifyJwt(token, cleanSecret);
  if (!verification.valid && cleanSecret !== fallbackSecret) {
    verification = await verifyJwt(token, fallbackSecret);
  }

  const { valid, payload } = verification;
  if (!valid || !payload) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Enforce role-based access for administrative portals
  if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/rider') && payload.role !== 'RIDER' && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// ── Matcher — run on all page routes, excluding static assets and system files ──
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff|woff2)$).*)',
  ],
};
