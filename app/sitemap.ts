import {
  contactCategoryId,
  contactFooterCategoryId,
  contactPath,
  inspirationCategoryId,
} from "@/lib/content/contact-route";
import { academyCategoryId, academyPath } from "@/lib/content/academy-route";
import {
  aboutCategoryId,
  aboutFooterCategoryId,
  aboutPath,
} from "@/lib/content/about-route";
import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/shopware/products";
import { getCategories } from "@/lib/shopware/categories";
import { productPath } from "@/lib/shopware/urls";
import { siteUrl } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    "/",
    "/produkte",
    "/toenung",
    aboutPath,
    academyPath,
    contactPath,
  ];
  try {
    const categories = await getCategories();
    paths.push(
      ...categories.elements
        .filter(
          (c) =>
            c.id !== aboutCategoryId &&
            c.id !== aboutFooterCategoryId &&
            c.id !== academyCategoryId &&
            c.id !== contactCategoryId &&
            c.id !== contactFooterCategoryId &&
            c.id !== inspirationCategoryId,
        )
        .map((c) => `/kategorie/${c.id}`),
    );
    let page = 1;
    while (page <= 2000) {
      const products = await getProducts(page);
      paths.push(...products.elements.map(productPath));
      if (
        products.elements.length < 24 ||
        (products.total !== undefined && page * 24 >= products.total)
      )
        break;
      page++;
    }
  } catch {
    /* Never fabricate catalog entries when the Store API is unavailable. */
  }
  return [...new Set(paths)].map((path) => ({
    url: new URL(path, siteUrl()).href,
  }));
}
