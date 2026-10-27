import { writeFile } from "node:fs/promises";
import { getContext, getLanguages } from "../lib/shopware/context";
import { getProducts, getProduct, getVariants } from "../lib/shopware/products";
import {
  getCategories,
  getCategory,
  getCategoryProducts,
} from "../lib/shopware/categories";
import { getNavigation } from "../lib/shopware/navigation";
import { productName, productPath } from "../lib/shopware/urls";
import { resolveProductId } from "../lib/shopware/resolve";

async function main() {
  const context = await getContext();
  const [categories, navigation, languages] = await Promise.all([
    getCategories(),
    getNavigation(),
    getLanguages(),
  ]);
  const catalog = [];
  for (let page = 1; page <= 100; page++) {
    const result = await getProducts(page);
    catalog.push(...result.elements);
    if (
      result.elements.length < 24 ||
      (result.total !== undefined && catalog.length >= result.total)
    )
      break;
  }
  const proofs = [];
  for (const p of catalog.filter((p) => !p.parentId).slice(0, 3)) {
    const detail = await getProduct(p.id);
    const variants = await getVariants(detail.parentId || detail.id);
    const cover = detail.cover?.media?.url;
    const mediaStatus = cover
      ? (
          await fetch(cover, {
            method: "HEAD",
            signal: AbortSignal.timeout(10000),
          })
        ).status
      : null;
    const seo = detail.seoUrls?.find((s) => s.isCanonical)?.seoPathInfo;
    const resolved = seo ? await resolveProductId(seo.split("/")) : undefined;
    proofs.push({
      requestedId: p.id,
      id: detail.id,
      number: detail.productNumber,
      name: productName(detail),
      price: detail.calculatedPrice?.unitPrice,
      currency: context.currency.isoCode,
      cover,
      mediaStatus,
      categories: detail.categories?.map((c) => ({
        id: c.id,
        name: c.translated?.name || c.name,
      })),
      available: detail.available,
      stock: detail.stock,
      options: detail.options,
      variantsRetrieved: variants.elements.length,
      manufacturer: detail.manufacturer?.name,
      customFieldKeys: Object.keys(detail.customFields || {}),
      seo: detail.seoUrls,
      seoResolvesToProduct: resolved === detail.id,
      description: detail.translated?.description,
      localUrl: "http://localhost:3000" + productPath(detail),
    });
  }
  const categoryId = proofs[0]?.categories?.[0]?.id;
  const categoryCheck = categoryId
    ? {
        category: (await getCategory(categoryId)).translated?.name,
        retrieved: (await getCategoryProducts(categoryId)).elements.length,
      }
    : null;
  const languageId = context.salesChannel.languageId;
  const report = {
    verifiedAt: new Date().toISOString(),
    storeApiUrl: process.env.SHOPWARE_STORE_API_URL,
    context: {
      id: context.salesChannel.id,
      name: context.salesChannel.name,
      currency: context.currency.isoCode,
      languageId,
      language: languages.elements.find((l) => l.id === languageId),
    },
    catalog: {
      retrieved: catalog.length,
      categoriesRetrieved: categories.elements.length,
      navigationRoots: navigation.length,
      categoryCheck,
    },
    products: proofs,
  };
  await writeFile(
    "SHOPWARE-VERIFICATION.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Verification failed");
  process.exitCode = 1;
});
