import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getProduct, getVariants } from "@/lib/shopware/products";
import { getContext } from "@/lib/shopware/context";
import { resolveProductId } from "@/lib/shopware/resolve";
import { productName, productPath } from "@/lib/shopware/urls";
import { ShopwareError } from "@/lib/shopware/client";
import {
  metadata as pageMetadata,
  plainText,
  siteUrl,
  jsonLd,
} from "@/lib/seo";
import { ProductGallery } from "@/components/product/media";
import {
  ProductPrice,
  ProductOptions,
  ProductBadge,
} from "@/components/product/products";
import { Container, Breadcrumbs } from "@/components/ui/primitives";
import { CommerceState } from "@/components/commerce-state";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string[] }> };
export async function generateMetadata({ params }: Props) {
  try {
    const id = await resolveProductId((await params).slug);
    if (!id) return { robots: { index: false } };
    const product = await getProduct(id);
    return pageMetadata(
      product.translated?.metaTitle || productName(product),
      productPath(product),
      plainText(product.translated?.metaDescription),
    );
  } catch {
    return { title: "Produkt", robots: { index: false } };
  }
}
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let id, product, context, variants;
  try {
    id = await resolveProductId(slug);
    if (id) {
      [product, context] = await Promise.all([getProduct(id), getContext()]);
      variants = product.childCount
        ? (await getVariants(product.id)).elements
        : product.parentId
          ? (await getVariants(product.parentId)).elements
          : [];
    }
  } catch (error) {
    if (error instanceof ShopwareError && error.code === "NOT_FOUND")
      notFound();
    return (
      <Container>
        <CommerceState error={error} />
      </Container>
    );
  }
  if (!product || !context) notFound();
  if (slug.join("/") !== product.id) permanentRedirect(productPath(product));
  const name = productName(product);
  const images = [
    product.cover?.media,
    ...(product.media?.map((m) => m.media) || []),
  ]
    .filter((m): m is NonNullable<typeof m> => !!m)
    .filter(
      (m, index, list) =>
        list.findIndex((other) => other.url === m.url) === index,
    );
  const url = new URL(productPath(product), siteUrl()).href;
  const structured = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: product.productNumber,
    image: images.map((m) => m.url),
    ...(product.manufacturer?.name
      ? { brand: { "@type": "Brand", name: product.manufacturer.name } }
      : {}),
    ...(product.calculatedPrice
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: product.calculatedPrice.unitPrice,
            priceCurrency: context.currency.isoCode,
            ...(typeof product.available === "boolean"
              ? {
                  availability: `https://schema.org/${product.available ? "InStock" : "OutOfStock"}`,
                }
              : {}),
          },
        }
      : {}),
  };
  return (
    <Container>
      <Breadcrumbs
        items={[{ label: "Produkte", href: "/produkte" }, { label: name }]}
      />
      <div className="product-detail">
        <ProductGallery images={images} name={name} />
        <div>
          <p className="eyebrow">{product.manufacturer?.name || "VIERO"}</p>
          <h1>{name}</h1>
          <p className="muted">Artikelnummer {product.productNumber}</p>
          <ProductPrice
            product={product}
            currency={context.currency.isoCode}
            taxState={context.taxState}
          />
          <ProductBadge product={product} />
          <p className="description">
            {plainText(product.translated?.description)}
          </p>
          <nav aria-label="Produktkategorien">
            {product.categories?.map((category) => (
              <Link
                className="variant-link"
                key={category.id}
                href={`/kategorie/${category.id}`}
              >
                {category.translated?.name || category.name}
              </Link>
            ))}
          </nav>
          <ProductOptions product={product} variants={variants || []} />
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Produkte",
                item: new URL("/produkte", siteUrl()).href,
              },
              { "@type": "ListItem", position: 2, name, item: url },
            ],
          }),
        }}
      />
    </Container>
  );
}
