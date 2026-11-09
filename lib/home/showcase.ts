import "server-only";
import { getProduct } from "../shopware/products";

// Curated from the live catalogue and visually audited; content stays in Shopware.
export const showcaseProductIds = [
  "019091c88eea72e5b497a64162ab435f", // Erametal
  "019091a18051717ca7e33783dbabb651", // Allure
  "0190a15886267e59a54d7152d79fff7f", // Marmorin Hydro
  "0191651721d876039a85becdc44509cf", // Oltre
  "01910ec63cb37734ba2f0a13c7c269d9", // Travertine
  "0190a0f5fefe73409802a3f0db8217c4", // Rusten Finish
  "0190a5bc4d9d7b468a98f39ab6a047f7", // Marmorin Sand
] as const;

export async function getShowcaseProducts() {
  const results = await Promise.allSettled(showcaseProductIds.map(getProduct));
  const seen = new Set<string>();
  return results.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const product = result.value;
    // Shopware can resolve a parent to its purchasable variant.
    if (
      !product.cover?.media?.url.startsWith("https://") ||
      seen.has(product.id)
    )
      return [];
    seen.add(product.id);
    return [product];
  });
}
