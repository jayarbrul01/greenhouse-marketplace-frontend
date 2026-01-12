import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Note: We use client-side auth with localStorage, so middleware can't check tokens
  // The protected layout handles authentication checks on the client side
  // This middleware is kept for potential future cookie-based auth
  return NextResponse.next();
}
