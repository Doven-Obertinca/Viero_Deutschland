import type { Product } from "@/lib/shopware/types";
export type ProductOption = NonNullable<Product["options"]>[number];
export function isColour(option: ProductOption) {
  return (
    /farb|colou?r/i.test(option.group?.name || "") || !!option.colorHexCode
  );
}
const approximations: Record<string, string> = {
  gold: "#c7ac79",
  silber: "#bfc4c3",
  weiß: "#eeeae2",
  weiss: "#eeeae2",
  neutral: "#d9d1c2",
  grau: "#9fa3a0",
  rot: "#aa6759",
  gelb: "#d6b666",
  grün: "#8c9f88",
  pink: "#cfa6a3",
  schwarz: "#3a3c3b",
  onyx: "#454646",
  leucit: "#e5dfd3",
  light: "#dfd9cd",
  medium: "#b8ac98",
  "medium-dark": "#8e8474",
};
export function colourPreview(option?: ProductOption) {
  const hex = option?.colorHexCode?.trim();
  if (hex && /^#[a-f0-9]{6}$/i.test(hex))
    return { colour: hex, approximate: false };
  const colour = approximations[option?.name?.toLowerCase() || ""];
  return {
    colour: colour || "#deded7",
    approximate: !!colour,
    unavailable: !colour,
  };
}
export function panelInk(hex: string) {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 >
    0.18
    ? "#252724"
    : "#faf9f4";
}
export function matchingVariant(
  variants: Product[],
  chosen: Record<string, string>,
) {
  return variants.find((variant) =>
    Object.entries(chosen).every(([group, id]) =>
      variant.options?.some(
        (option) =>
          (option.group?.name || "Ausführung") === group && option.id === id,
      ),
    ),
  );
}
