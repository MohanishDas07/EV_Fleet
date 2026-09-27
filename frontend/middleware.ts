import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Extract host (e.g., 'tenant-a.voltgrid.com', 'localhost:3000')
  const host = request.headers.get('host') || '';
  
  // Ignore specific paths like API, _next/static, public files
  if (url.pathname.startsWith('/api') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Parse the subdomain (Tenant Slug)
  // For local testing on localhost, we assume no subdomain, or split by dot.
  let tenantSlug = 'public';
  if (host.includes('voltgrid.com')) {
    tenantSlug = host.split('.')[0]; 
  } else if (host.includes('localhost')) {
    // Fallback for local development if passing a specific header
    tenantSlug = request.headers.get('x-local-tenant') || 'demo-tenant';
  }

  // Rewrite the URL to the tenant's specific app route
  // e.g. /dashboard -> /app/tenant-a/dashboard
  // url.pathname = `/app/${tenantSlug}${url.pathname}`;

  // Clone headers and inject the tenant ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenantSlug);

  // Return the rewritten response with the isolated tenant headers
  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}

// Only apply middleware to the main app paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
