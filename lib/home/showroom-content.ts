import { z } from "zod";
import { mediaSchema } from "../shopware/types";

const imageSchema = mediaSchema.extend({
  private: z.boolean().optional(),
  mimeType: z.string().nullish(),
  metaData: z.object({ width: z.number(), height: z.number() }).nullish(),
  thumbnails: z
    .array(z.object({ url: z.string(), width: z.number() }))
    .nullish(),
});
const slotSchema = z.object({
  extensions: z.record(z.string(), z.unknown()).nullish(),
  id: z.string().optional(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()).nullish(),
  config: z.record(z.string(), z.unknown()).nullish(),
  translated: z
    .object({ config: z.record(z.string(), z.unknown()).nullish() })
    .nullish(),
});
export const showroomCategorySchema = z.object({
  id: z.string(),
  active: z.boolean().optional(),
  name: z.string().nullish(),
  translated: z
    .object({ name: z.string().nullish(), description: z.string().nullish() })
    .nullish(),
  media: imageSchema.nullish(),
  seoUrls: z
    .array(
      z.object({
        seoPathInfo: z.string(),
        isCanonical: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
      }),
    )
    .nullish(),
  cmsPage: z
    .object({
      sections: z
        .array(
          z.object({
            position: z.number().optional(),
            blocks: z
              .array(
                z.object({
                  position: z.number().optional(),
                  slots: z.array(slotSchema).nullish(),
                }),
              )
              .nullish(),
          }),
        )
        .nullish(),
    })
    .nullish(),
});
export type ShowroomMedia = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
};
export type ShowroomContent = {
  title: string;
  headline?: string;
  description?: string;
  paragraphs?: string[];
  appointmentNote?: string;
  pageUrl?: string;
  appointmentUrl?: string;
  directionsUrl?: string;
  address: string[];
  phone?: { label: string; href: string };
  email?: { label: string; href: string };
  openingHours: { label: string; ranges: string[] }[];
  media: ShowroomMedia[];
};

function text(html: string) {
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    auml: "ä",
    ouml: "ö",
    uuml: "ü",
    Auml: "Ä",
    Ouml: "Ö",
    Uuml: "Ü",
    szlig: "ß",
  };
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (whole, entity: string) => {
      if (!entity.startsWith("#")) return entities[entity] ?? whole;
      const value =
        entity[1].toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : Number(entity.slice(1));
      return value > 0 &&
        value <= 0x10ffff &&
        !(value >= 0xd800 && value <= 0xdfff)
        ? String.fromCodePoint(value)
        : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}
function attribute(html: string, name: string) {
  const match = html.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return match ? text(match[1] ?? match[2]) : undefined;
}
function webUrl(value: string | undefined, origin: string) {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value, origin);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
function firstSentence(value: string) {
  const segment = new Intl.Segmenter("de", { granularity: "sentence" }).segment(
    value,
  );
  return Array.from(segment)[0]?.segment.trim() || undefined;
}
function ordered<T extends { position?: number }>(
  items: T[] | null | undefined,
) {
  return [...(items || [])].sort(
    (a, b) => (a.position || 0) - (b.position || 0),
  );
}

// Consume resolved standard CMS content. No business values or form recipients
// are substituted when showroom-specific information is absent.
export function parseShowroom(
  category: z.infer<typeof showroomCategorySchema>,
  origin: string,
): ShowroomContent | null {
  const title = text(category.translated?.name || category.name || "");
  if (!title || category.active === false) return null;
  const slots = ordered(category.cmsPage?.sections).flatMap((section) =>
    ordered(section.blocks).flatMap((block) => block.slots || []),
  );
  const html = slots
    .filter((slot) => slot.type === "text")
    .map((slot) => {
      const config = slot.translated?.config || slot.config;
      const content = config?.content as { value?: unknown } | undefined;
      const value = slot.data?.content ?? content?.value;
      return typeof value === "string" &&
        !/Headline:\s*category\.name/i.test(value)
        ? value
        : "";
    })
    .filter(Boolean)
    .join("\n");
  const heading = html.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1];
  const prose = html.replace(/<(address|table)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const paragraphs = [...prose.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .filter((match) => !/href\s*=\s*["'](?:tel:|mailto:)/i.test(match[1]))
    .map((match) => text(match[1]))
    .filter(Boolean);
  const seo = category.seoUrls?.find(
    (entry) => entry.isCanonical && !entry.isDeleted,
  );
  const pageUrl = webUrl(
    seo?.seoPathInfo ? `/${seo.seoPathInfo.replace(/^\/+/, "")}` : undefined,
    origin,
  );
  const content: ShowroomContent = {
    title,
    headline: heading ? text(heading) : undefined,
    description: firstSentence(
      paragraphs.find((p) => !/^(?:Termin|Vereinbaren|Kontakt)/i.test(p)) ||
        text(category.translated?.description || ""),
    ),
    paragraphs,
    appointmentNote: paragraphs.find((p) => /(?:Termin|Vereinbarung)/i.test(p)),
    pageUrl,
    appointmentUrl: slots.some((slot) =>
      ["custom-form", "form"].includes(slot.type),
    )
      ? pageUrl
      : undefined,
    address: [
      ...html.matchAll(/<address\b[^>]*>([\s\S]*?)<\/address>/gi),
    ].flatMap((match) =>
      match[1]
        .split(/<br\s*\/?\s*>|<\/p>/i)
        .map(text)
        .filter(Boolean),
    ),
    openingHours: [],
    media: [],
  };
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attribute(match[1], "href");
    const label = text(match[2]);
    if (!href) continue;
    if (/^tel:\+?[\d\s().-]+$/i.test(href) && !content.phone) {
      content.phone = {
        label: label || href.slice(4),
        href: `tel:${href.slice(4).replace(/[^\d+]/g, "")}`,
      };
    } else if (
      /^mailto:[^\s@?]+@[^\s@?]+\.[^\s@?]+$/i.test(href) &&
      !content.email
    ) {
      content.email = { label: label || href.slice(7), href };
    } else if (/termin|beratung/i.test(label)) {
      content.appointmentUrl = webUrl(href, origin) || content.appointmentUrl;
    } else if (/route|anfahrt|wegbeschreibung/i.test(label)) {
      content.directionsUrl = webUrl(href, origin);
    }
  }
  // Editors can use the existing CMS text editor's table, headed/captioned
  // Öffnungszeiten. Multiple cells or <br> ranges are retained per day.
  for (const match of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    if (!/öffnungszeiten/i.test(text(match[1]))) continue;
    for (const row of match[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [
        ...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi),
      ].map((cell) => cell[1]);
      if (cells.length < 2 || /öffnungszeiten/i.test(text(cells[0]))) continue;
      const label = text(cells[0]);
      const ranges = cells.slice(1).flatMap((cell) =>
        cell
          .split(/<br\s*\/?\s*>/i)
          .map(text)
          .filter(Boolean),
      );
      if (label && ranges.length) content.openingHours.push({ label, ranges });
    }
  }
  const mediaCandidates: unknown[] = [category.media];
  function collect(value: unknown) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    const item = value as Record<string, unknown>;
    if (typeof item.url === "string" && item.metaData)
      mediaCandidates.push(item);
    else Object.values(item).forEach(collect);
  }
  slots
    .filter((slot) =>
      ["image", "image-gallery", "image-slider"].includes(slot.type),
    )
    .forEach((slot) => collect(slot.data));
  const seen = new Set<string>();
  for (const candidate of mediaCandidates) {
    const parsed = imageSchema.safeParse(candidate);
    if (!parsed.success) continue;
    const media = parsed.data;
    const width = media.metaData?.width;
    const height = media.metaData?.height;
    if (
      media.private ||
      (media.mimeType && !media.mimeType.startsWith("image/")) ||
      !width ||
      !height ||
      width < 1 ||
      height < 1
    )
      continue;
    const key = media.id || media.url;
    if (seen.has(key)) continue;
    const thumbnail = [...(media.thumbnails || [])]
      .filter((item) => item.width <= 1920)
      .sort((a, b) => b.width - a.width)
      .find((item) => webUrl(item.url, origin));
    const url = webUrl(thumbnail?.url || media.url, origin);
    if (!url) continue;
    seen.add(key);
    content.media.push({
      id: key,
      url,
      alt: media.alt || `${title} – Einblick in die Materialausstellung`,
      width,
      height,
    });
    if (content.media.length === 5) break;
  }
  return content;
}

export { text as cmsText };
