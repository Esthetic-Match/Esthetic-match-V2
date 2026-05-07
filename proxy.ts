import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost?.replace(/:\d+$/, "");

    if (host) {
      return NextResponse.redirect(`https://${host}/en`);
    }

    return NextResponse.redirect(new URL("/en", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};