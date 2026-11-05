"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCookieConfiguration } from "@/lib/content/cookies";
import { allChoices, normalizeChoices } from "@/lib/content/cookie-model";
import { consentWrites } from "@/lib/content/consent-policy";
export async function saveCookies(data: FormData) {
  const config = await getCookieConfiguration();
  if (!config.available) redirect("/cookies?status=unavailable");
  const mode = data.get("selection");
  const choices =
    mode === "all"
      ? allChoices(config.groups, true)
      : mode === "necessary"
        ? allChoices(config.groups, false)
        : normalizeChoices(
            config.groups,
            Object.fromEntries(
              config.groups.flatMap((g) =>
                g.entries.map((e) => [e.name, data.get(e.name) === "on"]),
              ),
            ),
          );
  const store = await cookies();
  for (const entry of consentWrites(config, choices))
    store.set(entry.name, entry.value, {
      path: "/",
      maxAge: entry.maxAge,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  if (
    !choices["google-analytics-enabled"] ||
    !choices["google-ads-enabled"] ||
    !choices["_swa_consent_enabled"]
  ) {
    for (const cookie of store.getAll())
      if (
        (!choices["google-analytics-enabled"] &&
          /^(?:_ga(?:_|$)|_swag_ga)/.test(cookie.name)) ||
        (!choices["google-ads-enabled"] && /^_gcl_/.test(cookie.name)) ||
        (!choices["_swa_consent_enabled"] && /^_swa_/.test(cookie.name))
      )
        store.set(cookie.name, "", { path: "/", maxAge: 0 });
  }
  redirect("/cookies?status=saved");
}
