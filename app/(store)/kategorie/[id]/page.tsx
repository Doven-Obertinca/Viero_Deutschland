import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategory, getCategoryProducts } from "@/lib/shopware/categories";
import { getContext } from "@/lib/shopware/context";
import { isShopwareId } from "@/lib/shopware/urls";
import { ShopwareError } from "@/lib/shopware/client";
import { metadata as pageMetadata, plainText } from "@/lib/seo";
import { Container, Breadcrumbs } from "@/components/ui/primitives";
import { ProductGrid } from "@/components/product/products";
import { CommerceState } from "@/components/commerce-state";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isShopwareId(id)) return {};
  try {
    const category = await getCategory(id);
    return pageMetadata(
      category.metaTitle ||
        category.translated?.name ||
        category.name ||
        "Kategorie",
      `/kategorie/${id}`,
      plainText(category.metaDescription),
    );
  } catch {
    return { title: "Kategorie", robots: { index: false } };
  }
}
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  if (!isShopwareId(id)) notFound();
  const value = Number((await searchParams).page || 1);
  const page =
    Number.isInteger(value) && value > 0 && value <= 10000 ? value : 1;
  let data;
  try {
    data = await Promise.all([
      getCategory(id),
      getCategoryProducts(id, page),
      getContext(),
    ]);
  } catch (error) {
    if (error instanceof ShopwareError && error.code === "NOT_FOUND")
      notFound();
    return (
      <Container>
        <h1>Kategorie</h1>
        <CommerceState error={error} />
      </Container>
    );
  }
  const [category, products, context] = data;
  const name = category.translated?.name || category.name || "Kategorie";
  return (
    <Container>
      <Breadcrumbs
        items={[{ label: "Produkte", href: "/produkte" }, { label: name }]}
      />
      <h1>{name}</h1>
      <p>{plainText(category.translated?.description)}</p>
      <ProductGrid
        products={products.elements}
        currency={context.currency.isoCode}
        taxState={context.taxState}
      />
      <nav className="pagination" aria-label="Kategorieseiten">
        {page > 1 && <Link href={`?page=${page - 1}`}>Zurück</Link>}
        <span>Seite {page}</span>
        {(products.total
          ? page * 24 < products.total
          : products.elements.length === 24) && (
          <Link href={`?page=${page + 1}`}>Weiter</Link>
        )}
      </nav>
    </Container>
  );
}
