import "server-only";
import { cookies } from "next/headers";
export const SESSION_COOKIE = "viero-context";
export const validContextToken = (token: string) =>
  /^[a-zA-Z0-9_-]{16,256}$/.test(token);
export async function readSessionToken() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return token && validContextToken(token) ? token : undefined;
  } catch (error) {
    // Verification scripts run outside an HTTP request and have no browser session.
    if (
      error instanceof Error &&
      error.message.includes("outside a request scope")
    )
      return undefined;
    throw error;
  }
}
export async function saveSessionToken(token: string) {
  if (!validContextToken(token)) throw new Error("Invalid context token");
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
export async function clearSessionToken() {
  (await cookies()).delete(SESSION_COOKIE);
}
