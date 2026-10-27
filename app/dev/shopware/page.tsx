import { notFound } from "next/navigation";
import { getContext, getLanguages } from "@/lib/shopware/context";
import { getProducts } from "@/lib/shopware/products";
import { getCategories } from "@/lib/shopware/categories";
import { getNavigation } from "@/lib/shopware/navigation";
import { ShopwareError } from "@/lib/shopware/client";
import { ProductGrid } from "@/components/product/products";
import { Container } from "@/components/ui/primitives";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Shopware Diagnostics",
  robots: { index: false, follow: false },
};
function panel(name: string, data: unknown) {
  return (
    <details key={name}>
      <summary>{name}</summary>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}
export default async function Diagnostics() {
  if (process.env.NODE_ENV !== "development") notFound();
  const results = await Promise.allSettled([
    getContext(),
    getProducts(),
    getCategories(),
    getNavigation(),
    getLanguages(),
  ] as const);
  const [context, products, categories, navigation, languages] = results;
  const c = context.status === "fulfilled" ? context.value : undefined;
  const language =
    languages.status === "fulfilled"
      ? languages.value.elements.find(
          (l) => l.id === c?.salesChannel.languageId,
        )
      : undefined;
  return (
    <Container>
      <h1>Shopware Connection</h1>
      <p>
        {results.every((r) => r.status === "fulfilled")
          ? "✓ API reachable — all catalog checks passed"
          : "Connection / catalog error"}
      </p>
      {results.map((result, index) =>
        result.status === "rejected" ? (
          <p role="status" key={index}>
            {
              ["Context", "Products", "Categories", "Navigation", "Languages"][
                index
              ]
            }
            :{" "}
            {result.reason instanceof ShopwareError
              ? `${result.reason.code}${result.reason.status ? ` (HTTP ${result.reason.status})` : ""}`
              : "UNAVAILABLE"}
          </p>
        ) : null,
      )}
      {!c && (
        <p>
          Configure SHOPWARE_STORE_API_URL and SHOPWARE_STORE_API_ACCESS_KEY in
          .env.local. Obtain the key in Administration → Sales Channels → active
          sales channel → API access.
        </p>
      )}
      {c && (
        <>
          <h2>Sales Channel</h2>
          <p>
            {c.salesChannel.name} / {c.salesChannel.id}
          </p>
          <p>
            Currency: {c.currency.isoCode}; Language:{" "}
            {language?.name ||
              c.salesChannel.languageId ||
              c.languageIdChain?.join(", ") ||
              "not returned"}
          </p>
          {panel("Context (allowlisted; no session token)", {
            salesChannel: {
              id: c.salesChannel.id,
              name: c.salesChannel.name,
              navigationCategoryId: c.salesChannel.navigationCategoryId,
            },
            currency: c.currency.isoCode,
            languageIdChain: c.languageIdChain,
            language,
            taxState: c.taxState,
          })}
        </>
      )}
      <h2>Catalog</h2>
      <p>
        Retrieved products:{" "}
        {products.status === "fulfilled" ? products.value.elements.length : 0};
        total products:{" "}
        {products.status === "fulfilled" ? products.value.total : "unknown"};
        retrieved categories:{" "}
        {categories.status === "fulfilled"
          ? categories.value.elements.length
          : 0}
      </p>
      {products.status === "fulfilled" && (
        <>
          <ProductGrid
            products={products.value.elements.slice(0, 6)}
            currency={c?.currency.isoCode}
            taxState={c?.taxState}
          />
          {panel(
            "Products: availability, categories, options, custom fields, SEO",
            products.value,
          )}
        </>
      )}
      {categories.status === "fulfilled" &&
        panel("Categories", categories.value)}
      <h2>Navigation</h2>
      {navigation.status === "fulfilled" &&
        panel("Root navigation", navigation.value)}
    </Container>
  );
}
