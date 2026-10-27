import Link from "next/link";
import { getProducts } from "@/lib/shopware/products";
import { getContext } from "@/lib/shopware/context";
import { getCategories } from "@/lib/shopware/categories";
import { Container, Breadcrumbs } from "@/components/ui/primitives";
import { ProductGrid } from "@/components/product/products";
import { CategoryCard } from "@/components/category/category-card";
import { CommerceState } from "@/components/commerce-state";
import { metadata as pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Produkte", "/produkte");
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const raw = Number((await searchParams).page || 1);
  const page = Number.isInteger(raw) && raw > 0 && raw <= 10000 ? raw : 1;
  let data;
  try {
    data = await Promise.all([
      getProducts(page),
      getContext(),
      getCategories(),
    ]);
  } catch (error) {
    return (
      <Container>
        <h1>Produkte</h1>
        <CommerceState error={error} />
      </Container>
    );
  }
  const [products, context, categories] = data;
  const content = (
    <>
      <div className="category-links">
        {categories.elements.slice(0, 12).map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
      <ProductGrid
        products={products.elements}
        currency={context.currency.isoCode}
        taxState={context.taxState}
      />
      <nav className="pagination" aria-label="Produktseiten">
        {page > 1 && <Link href={`/produkte?page=${page - 1}`}>Zurück</Link>}
        <span>Seite {page}</span>
        {(products.total
          ? page * 24 < products.total
          : products.elements.length === 24) && (
          <Link href={`/produkte?page=${page + 1}`}>Weiter</Link>
        )}
      </nav>
    </>
  );

  return (
    <Container>
      <Breadcrumbs
        items={[{ label: "Start", href: "/" }, { label: "Produkte" }]}
      />
      <div className="page-heading">
        <p className="eyebrow">VIERO / KOLLEKTION</p>
        <h1>Produkte</h1>
      </div>
      {content}
    </Container>
  );
}
