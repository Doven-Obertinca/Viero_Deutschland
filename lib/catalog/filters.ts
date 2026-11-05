import { applicationFacets } from "./applications";
import type { Product } from "../shopware/types";
import { productName, productPath } from "../shopware/urls";
export type CatalogItem = {
  variants?: CatalogItem[];
  fromPrice?: boolean;
  id: string;
  name: string;
  href: string;
  image?: string;
  alt: string;
  price?: number;
  available?: boolean;
  facets: Record<string, string[]>;
  subtitle: string;
};
export type Selection = Record<string, string[]>;
export function productFacets(product: Product) {
  const facets: Selection = applicationFacets(product);
  const add = (group: string, value?: string | null) => {
    if (value)
      facets[group] = Array.from(new Set([...(facets[group] || []), value]));
  };
  product.categories
    ?.filter((c) => !c.children?.length)
    .forEach((c) => add("Produktart", c.translated?.name || c.name));
  [...(product.properties || []), ...(product.options || [])].forEach((p) => {
    const name = p.group?.name;
    if (name && p.name) {
      const group = /^farbton|^farbe/i.test(name)
        ? "Farbton"
        : /einheit|gebinde|inhalt/i.test(name)
          ? "Gebindegröße"
          : name;
      add(group, p.name);
    }
  });
  return facets;
}
export function matches(
  item: CatalogItem,
  selection: Selection,
  query: string,
  price: string,
  available: boolean,
  omit?: string,
): boolean {
  if (item.variants?.length)
    return item.variants.some((variant) =>
      matches(variant, selection, query, price, available, omit),
    );
  if (
    query.trim() &&
    !`${item.name} ${item.subtitle} ${Object.values(item.facets).flat().join(" ")}`
      .toLocaleLowerCase("de")
      .includes(query.trim().toLocaleLowerCase("de"))
  )
    return false;
  if (available && item.available !== true) return false;
  if (price) {
    if (item.price === undefined) return false;
    const [min, max] = price.split(":").map(Number);
    if (item.price < min || item.price >= max) return false;
  }
  return Object.entries(selection).every(
    ([group, values]) =>
      group === omit ||
      !values.length ||
      values.some((value) => item.facets[group]?.includes(value)),
  );
}
export function buildCatalog(products: Product[]): CatalogItem[] {
  const families = new Map<string, Product[]>();
  products.forEach((product) => {
    const id = product.parentId || product.id;
    families.set(id, [...(families.get(id) || []), product]);
  });
  return [...families].map(([id, family]) => {
    const parent = family.find((product) => product.id === id) || family[0];
    const children = family.filter((product) => product.parentId);
    const variants = (children.length ? children : [parent]).map((product) => {
      const facets = productFacets(product);
      const inherited = productFacets(parent);
      for (const group of [
        "Produktart",
        "Einsatzbereich",
        "Zimmer",
        "Fläche",
      ]) {
        if (!facets[group]?.length && inherited[group]?.length)
          facets[group] = [...inherited[group]];
      }
      return {
        id: product.id,
        name: productName(parent),
        href: productPath(product),
        image: product.cover?.media?.url || parent.cover?.media?.url,
        alt: product.cover?.media?.alt || productName(parent),
        price: product.calculatedPrice?.unitPrice,
        available: product.available,
        facets,
        subtitle: Object.values(facets).flat().join(" · "),
      };
    });
    const facets: Selection = {};
    variants.forEach((variant) =>
      Object.entries(variant.facets).forEach(([group, values]) => {
        facets[group] = [...new Set([...(facets[group] || []), ...values])];
      }),
    );
    const prices = variants.flatMap((variant) =>
      variant.price === undefined ? [] : [variant.price],
    );
    return {
      id,
      name: productName(parent),
      href: productPath(parent),
      image:
        parent.cover?.media?.url ||
        variants.find((variant) => variant.image)?.image,
      alt: parent.cover?.media?.alt || productName(parent),
      price: prices.length ? Math.min(...prices) : undefined,
      fromPrice: children.length > 0,
      available: variants.some((v) => v.available === true)
        ? true
        : variants.every((v) => v.available === false)
          ? false
          : undefined,
      facets,
      variants,
      subtitle:
        facets.Produktart?.join(" · ") || "Viero Decoratives · Made in Italy",
    };
  });
}
