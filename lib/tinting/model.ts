import { z } from "zod";
import type { Product } from "../shopware/types";
import { isColour, colourPreview } from "../content/product-colours";
import { productName, productPath } from "../shopware/urls";
export const hexSchema = z.string().regex(/^#[a-f\d]{6}$/i);
export type TintColour = {
  id: string;
  name: string;
  code?: string;
  family: string;
  collection: string;
  hex?: string;
  accuracy: "catalogue" | "illustrative" | "unavailable";
  materialIds: string[];
};
export type TintMaterial = {
  id: string;
  name: string;
  href: string;
  image?: string;
  colourIds: string[];
};
export type TintCatalog = {
  colours: TintColour[];
  materials: TintMaterial[];
  available: boolean;
};
export function colourFamily(name: string, hex?: string) {
  if (/weiß|weiss|white|crem/i.test(name)) return "Weiß & Creme";
  if (/gold|gelb|ocker/i.test(name)) return "Gelb & Ocker";
  if (/silber|grau|graphit|anthrazit/i.test(name)) return "Grau";
  if (/schwarz|onyx/i.test(name)) return "Schwarz";
  if (/grün|green/i.test(name)) return "Grün";
  if (/blau|blue/i.test(name)) return "Blau";
  if (/pink|ros[ée]/i.test(name)) return "Rosé";
  if (/rot|red/i.test(name)) return "Rot";
  if (/braun|brown|bronze|kupfer/i.test(name)) return "Braun & Erde";
  if (/beige|sand/i.test(name)) return "Beige & Sand";
  if (!hex) return "Ohne Farbzuordnung";
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  if (d < 0.08)
    return max < 0.2 ? "Schwarz" : max > 0.88 ? "Weiß & Creme" : "Grau";
  let h =
    max === r
      ? ((g - b) / d) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return h < 20 || h >= 345
    ? "Rot"
    : h < 55
      ? max < 0.65
        ? "Braun & Erde"
        : "Beige & Sand"
      : h < 80
        ? "Gelb & Ocker"
        : h < 175
          ? "Grün"
          : h < 270
            ? "Blau"
            : "Rosé";
}
export function buildTintCatalog(products: Product[]): TintCatalog {
  const families = new Map<string, Product[]>();
  products.forEach((p) => {
    const key = p.parentId || p.id;
    families.set(key, [...(families.get(key) || []), p]);
  });
  const colours = new Map<string, TintColour>();
  const materials: TintMaterial[] = [];
  for (const [id, family] of families) {
    const parent = family.find((p) => p.id === id) || family[0];
    const colourIds = new Set<string>();
    for (const product of family)
      for (const option of product.options || []) {
        if (!isColour(option) || !option.name) continue;
        const key = `${id}:${option.id}`;
        const preview = colourPreview(option);
        colourIds.add(key);
        colours.set(key, {
          id: key,
          name: option.name,
          code: /^[A-Z]{1,6}[ -]?\d{1,6}$/i.test(option.name)
            ? option.name
            : undefined,
          family: colourFamily(
            option.name,
            preview.unavailable ? undefined : preview.colour,
          ),
          collection:
            option.group?.name?.replace(/^Farbton\s*\|\s*/i, "") ||
            productName(parent),
          hex: preview.unavailable ? undefined : preview.colour,
          accuracy: preview.unavailable
            ? "unavailable"
            : preview.approximate
              ? "illustrative"
              : "catalogue",
          materialIds: [id],
        });
      }
    if (colourIds.size)
      materials.push({
        id,
        name: productName(parent),
        href: productPath(parent),
        image:
          parent.cover?.media?.url ||
          family.find((p) => p.cover?.media?.url)?.cover?.media?.url,
        colourIds: [...colourIds],
      });
  }
  return {
    colours: [...colours.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "de", { numeric: true }),
    ),
    materials,
    available: true,
  };
}
export function oklab(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b),
    m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b),
    s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
export function similarColours(hex: string, colours: TintColour[]) {
  if (!hexSchema.safeParse(hex).success) return [];
  const lab = oklab(hex);
  return colours
    .filter((c) => c.hex && c.accuracy === "catalogue")
    .map((c) => ({
      colour: c,
      distance: Math.hypot(...oklab(c.hex!).map((v, i) => v - lab[i])),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((x) => x.colour);
}
export const savedSchema = z.object({
  version: z.literal(1),
  selection: z
    .object({ colourId: z.string().max(100), materialId: z.string().max(100) })
    .optional(),
  favourites: z.array(z.string().max(100)).max(500),
  projects: z
    .array(
      z.object({
        id: z.string().max(100),
        name: z.string().max(120),
        colourIds: z.array(z.string().max(100)).max(100),
        materialIds: z.array(z.string().max(100)).max(50),
        notes: z.string().max(3000),
        updated: z.string().max(40),
      }),
    )
    .max(30),
});
export type SavedColours = z.infer<typeof savedSchema>;
export const emptySaved: SavedColours = {
  version: 1,
  favourites: [],
  projects: [],
};
export function readSaved(raw: string | null): SavedColours {
  try {
    const result = savedSchema.safeParse(JSON.parse(raw || ""));
    return result.success ? result.data : emptySaved;
  } catch {
    return emptySaved;
  }
}
export function sharedSelection(params: URLSearchParams, catalog: TintCatalog) {
  return {
    colourIds: (params.get("farben") || "")
      .slice(0, 1600)
      .split(",")
      .filter((id) => catalog.colours.some((c) => c.id === id))
      .slice(0, 12),
    materialIds: (params.get("materialien") || "")
      .slice(0, 500)
      .split(",")
      .filter((id) => catalog.materials.some((m) => m.id === id))
      .slice(0, 6),
  };
}
export const accuracyLabel = (colour: TintColour) =>
  colour.accuracy === "catalogue"
    ? "Digitalwert aus dem Katalog"
    : colour.accuracy === "illustrative"
      ? "Illustrative Farbnäherung"
      : "Kein digitaler Farbwert hinterlegt";
