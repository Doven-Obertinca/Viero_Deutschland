import "server-only";
import { cache } from "react";
import { createHash } from "node:crypto";
import { shopwareConfig } from "../shopware/config";
import { parseCookieMarkup } from "./cookie-model";
export const getCookieConfiguration = cache(async () => {
  try {
    const origin = new URL(shopwareConfig().url).origin;
    // This installation predates the cookie-groups Store API. Its existing
    // offcanvas is the authoritative provider, including extension cookie groups.
    const response = await fetch(`${origin}/cookie/offcanvas`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error("Unavailable");
    const parsed = parseCookieMarkup(await response.text());
    return {
      ...parsed,
      available: parsed.groups.length > 0,
      version: createHash("sha256")
        .update(JSON.stringify(parsed))
        .digest("hex")
        .slice(0, 16),
    };
  } catch {
    return {
      groups: [],
      description: "",
      version: "unavailable",
      available: false,
    };
  }
});
