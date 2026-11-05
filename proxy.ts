import { contactPath } from "@/lib/content/contact-route";
import { academyPath } from "@/lib/content/academy-route";
import { aboutPath } from "@/lib/content/about-route";
import { NextResponse, type NextRequest } from "next/server";
// Block diagnostics before rendering/streaming so production always returns HTTP 404.
export function proxy(request: NextRequest) {
  if (/^\/Kontakt\/?$/.test(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = contactPath;
    return NextResponse.redirect(url, 308);
  }
  if (/^\/Akademie\/?$/.test(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = academyPath;
    return NextResponse.redirect(url, 308);
  }
  if (/^\/UEber-uns\/?$/.test(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = aboutPath;
    return NextResponse.redirect(url, 308);
  }
  if (
    request.nextUrl.pathname === "/Toenung" ||
    request.nextUrl.pathname === "/Toenung/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/toenung";
    return NextResponse.redirect(url, 308);
  }
  if (
    (request.nextUrl.pathname === "/dev" ||
      request.nextUrl.pathname.startsWith("/dev/")) &&
    process.env.NODE_ENV !== "development"
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store",
      },
    });
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dev/:path*",
    "/Toenung/:path*",
    "/UEber-uns",
    "/Akademie",
    "/Kontakt",
  ],
};
