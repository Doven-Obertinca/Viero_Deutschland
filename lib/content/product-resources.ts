import "server-only";
import { cache } from "react";
import type { Product } from "../shopware/types";
import { shopwareConfig } from "../shopware/config";
import { cmsText } from "../home/showroom-content";
export type ProductDownload = { title: string; url: string };
export type ProductVideo = {
  type: "youtube" | "vimeo" | "file";
  url: string;
  id: string;
};
export const getProductResources = cache(async (product: Product) => {
  const origin = new URL(shopwareConfig().url).origin;
  const downloads: ProductDownload[] = [];
  const videos: ProductVideo[] = [];
  const seen = new Set<string>();
  const addVideo = (type: ProductVideo["type"], id: string, url: string) => {
    if (!seen.has(url)) {
      seen.add(url);
      videos.push({ type, id, url });
    }
  };
  const translated = product.translated as Record<string, unknown> | undefined;
  // Product-specific slot overrides contain video IDs even where the shared CMS
  // layout currently omits the corresponding video slot.
  const configs = [translated?.slotConfig, product.slotConfig];
  const page = product.cmsPage as
    | {
        sections?: {
          blocks?: {
            slots?: { id: string; type: string; config: unknown }[];
          }[];
        }[];
      }
    | undefined;
  for (const section of page?.sections || [])
    for (const block of section.blocks || [])
      for (const slot of block.slots || []) {
        if (/youtube|vimeo/.test(slot.type))
          configs.push({ [slot.id]: slot.config });
      }
  for (const config of configs)
    if (config && typeof config === "object")
      for (const entry of Object.values(config)) {
        if (!entry || typeof entry !== "object") continue;
        const values = entry as Record<string, { value?: unknown }>;
        const id = values.videoID?.value;
        if (typeof id === "string" && /^[\w-]{11}$/.test(id))
          addVideo("youtube", id, `https://www.youtube.com/watch?v=${id}`);
        else if (typeof id === "string" && /^\d{6,12}$/.test(id))
          addVideo("vimeo", id, `https://vimeo.com/${id}`);
      }
  for (const entry of product.media || []) {
    const url = entry.media?.url;
    if (url && /^https:\/\//.test(url) && /\.(?:mp4|webm)(?:\?|$)/i.test(url))
      addVideo("file", entry.media?.id || url, url);
  }
  let failed = false;
  try {
    const path =
      product.seoUrls?.find((s) => s.isCanonical)?.seoPathInfo ||
      `detail/${product.id}`;
    const source = new URL(`/${path.replace(/^\/+/, "")}`, origin);
    if (source.origin !== origin) throw Error("Invalid source");
    const response = await fetch(source, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error("Unavailable");
    const html = await response.text();
    for (const block of html.matchAll(
      /<div\b[^>]*class="[^"]*\bproduct-download-item\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
    )) {
      const href = block[1].match(/\bhref="([^"]+)"/i)?.[1];
      const title = block[1].match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
      if (!href || !title) continue;
      const url = new URL(href.replace(/&amp;/g, "&"), origin);
      if (url.protocol !== "https:" || url.username || url.password) continue;
      if (!downloads.some((d) => d.url === url.href))
        downloads.push({ title: cmsText(title), url: url.href });
    }
  } catch {
    failed = true;
  }
  const fields = {
    ...(product.customFields || {}),
    ...((translated?.customFields as Record<string, unknown>) || {}),
  };
  const hasDownloads = Object.entries(fields).some(
    ([key, value]) =>
      /custom_product_downloads_/.test(key) &&
      typeof value === "string" &&
      /^[\da-f]{32}$/i.test(value),
  );
  return { origin, downloads, videos, unavailable: failed && hasDownloads };
});
