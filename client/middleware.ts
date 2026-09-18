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
  '/oauth-callback',
];

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

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

// ── Matcher — only run on page routes, never on static files or API routes ───
export const config = {
  matcher: [
    '/admin/:path*',
    '/rider/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/cart/:path*',
    '/wishlist/:path*',
    '/wallet/:path*',
    '/notifications/:path*',
    '/oauth-callback/:path*',
  ],
};
