import { contactFooterCategoryId, contactPath } from "./contact-route";
import { aboutFooterCategoryId, aboutPath } from "./about-route";
import { z } from "zod";
import { cmsText } from "../home/showroom-content";
export const footerCategorySchema = z.object({
  id: z.string(),
  parentId: z.string().nullish(),
  active: z.boolean().optional(),
  visible: z.boolean().optional(),
  name: z.string().nullish(),
  translated: z.object({ name: z.string().nullish() }).optional(),
  type: z.string().nullish(),
  externalLink: z.string().nullish(),
  cmsPageId: z.string().nullish(),
  seoUrls: z
    .array(
      z.object({
        seoPathInfo: z.string(),
        isCanonical: z.boolean().optional(),
      }),
    )
    .nullish(),
});
export type FooterLink = {
  id: string;
  title: string;
  href: string;
  cmsPageId?: string;
  sourcePath?: string;
};
export type FooterGroup = { id: string; title: string; links: FooterLink[] };
export function safePublicUrl(value: unknown, origin: string) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const u = new URL(value.trim(), origin);
    return ["https:", "http:"].includes(u.protocol) &&
      !u.username &&
      !u.password
      ? u.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function footerGroups(
  categories: unknown[],
  root: string,
  origin: string,
): FooterGroup[] {
  const parsed = categories.flatMap((c) => {
    const r = footerCategorySchema.safeParse(c);
    return r.success && r.data.active !== false && r.data.visible !== false
      ? [r.data]
      : [];
  });
  const label = (c: (typeof parsed)[number]) =>
    cmsText(c.translated?.name || c.name || "")
      .replace(/\*+$/, "")
      .trim();
  return parsed
    .filter((c) => c.parentId === root)
    .map((group) => ({
      id: group.id,
      title: label(group),
      links: parsed
        .filter((c) => c.parentId === group.id)
        .flatMap((c) => {
          const external =
            c.type === "link"
              ? safePublicUrl(c.externalLink, origin)
              : undefined;
          if (c.type === "link" && !external) return [];
          return [
            {
              id: c.id,
              title: label(c),
              href:
                c.id === aboutFooterCategoryId
                  ? aboutPath
                  : c.id === contactFooterCategoryId
                    ? contactPath
                    : external || `/informationen/${c.id}`,
              cmsPageId: c.cmsPageId || undefined,
              sourcePath: c.seoUrls?.find((s) => s.isCanonical)?.seoPathInfo,
            },
          ];
        }),
    }))
    .filter((g) => g.title && g.links.length > 0);
}
