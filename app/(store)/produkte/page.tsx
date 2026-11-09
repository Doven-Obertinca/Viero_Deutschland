import { getCatalogProducts } from "@/lib/shopware/products";
import { getContext } from "@/lib/shopware/context";
import { Container } from "@/components/ui/primitives";
import { CommerceState } from "@/components/commerce-state";
import { metadata as pageMetadata } from "@/lib/seo";
import { ProductCatalog } from "@/components/product/product-catalog";
import { buildCatalog } from "@/lib/catalog/filters";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Produkte", "/produkte");
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  let data;
  try {
    data = await Promise.all([getCatalogProducts(), getContext()]);
  } catch (error) {
    return (
      <Container>
        <h1>Produkte</h1>
        <CommerceState error={error} />
      </Container>
    );
  }
  const [products, context] = data;
  const items = buildCatalog(products);
  return (
    <ProductCatalog
      key={query}
      initialQuery={query}
      items={items}
      currency={context.currency.isoCode}
      taxState={context.taxState}
    />
  );
}
