import { NextResponse } from "next/server";
// Block diagnostics before rendering/streaming so production always returns HTTP 404.
export function proxy() {
  if (process.env.NODE_ENV !== "development") {
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
export const config = { matcher: "/dev/:path*" };
