import "server-only";
import { cache } from "react";
import { getCategories } from "../shopware/categories";
import { getContext } from "../shopware/context";
import { shopwareConfig } from "../shopware/config";
import { cmsText } from "../home/showroom-content";
import { footerGroups, safePublicUrl } from "./footer-model";

export const getFooterContent = cache(async () => {
  const [context, categories] = await Promise.all([
    getContext().catch(() => null),
    getCategories().catch(() => null),
  ]);
  const origin = (() => {
    try {
      return new URL(shopwareConfig().url).origin;
    } catch {
      return "";
    }
  })();
  const channel = context?.salesChannel;
  const root =
    typeof channel?.footerCategoryId === "string"
      ? channel.footerCategoryId
      : "";
  const fields = {
    ...((channel?.customFields as Record<string, unknown>) || {}),
    ...((channel?.translated as { customFields?: Record<string, unknown> })
      ?.customFields || {}),
  };
  const value = (key: string) =>
    typeof fields[key] === "string" ? cmsText(fields[key] as string) : "";
  const rawText =
    typeof fields.custom_storefront_contact_Text === "string"
      ? fields.custom_storefront_contact_Text
      : typeof fields.custom_storefront_contact_text === "string"
        ? fields.custom_storefront_contact_text
        : "";
  const email = value("custom_storefront_contact_email");
  const phone = value("custom_storefront_contact_phone");
  const groups = footerGroups(categories?.elements || [], root, origin);
  const social = ["instagram", "pinterest", "linkedin", "facebook"].flatMap(
    (name) => {
      const href = safePublicUrl(
        fields[`custom_storefront_contact_${name}`],
        origin,
      );
      return href
        ? [
            {
              title:
                name === "linkedin"
                  ? "LinkedIn"
                  : name[0].toUpperCase() + name.slice(1),
              href,
            },
          ]
        : [];
    },
  );
  return {
    origin,
    groups,
    brand:
      channel?.translated &&
      typeof (channel.translated as { name?: unknown }).name === "string"
        ? (channel.translated as { name: string }).name
        : "VIERO",
    contactIntro: cmsText(rawText.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, "")),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
    phone: /^\+?[\d\s().-]+$/.test(phone) ? phone : undefined,
    social,
    socialTitle: value("custom_storefront_contact_social_head"),
    socialText: value("custom_storefront_contact_social_text"),
    privacy: groups
      .flatMap((g) => g.links)
      .find((l) => /datenschutz/i.test(l.title)),
  };
});

// Keep the storefront's price notice source-backed as well as its legal pages.
export const getFooterPriceNotice = cache(async () => {
  try {
    const origin = new URL(shopwareConfig().url).origin;
    const response = await fetch(origin, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return "";
    const html = await response.text();
    return (
      html.match(
        /<div\b[^>]*class="[^"]*\bfooter-vat\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      )?.[1] || ""
    );
  } catch {
    return "";
  }
});
