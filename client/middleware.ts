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

async function verifyJwt(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

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

    if (!isValid) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64))
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;

    return true;
  } catch {
    return false;
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
  const tokenFromCookie = request.cookies.get('accessToken')?.value ?? null;
  const token = tokenFromHeader ?? tokenFromCookie;

  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const valid = await verifyJwt(token, secret);
  if (!valid) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
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
