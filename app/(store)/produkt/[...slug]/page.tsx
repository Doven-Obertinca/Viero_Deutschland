import { TextLink } from "@/components/ui/primitives";
import { approvedTextures } from "@/lib/visualizer/approvals";
import { visualizerPath } from "@/lib/visualizer/model";
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
import {
  ProductResources,
  ProductDownloads,
} from "@/components/product/product-resources";
import { ProductExperience } from "@/components/product/product-experience";
import { Container, Breadcrumbs } from "@/components/ui/primitives";
import { CommerceState } from "@/components/commerce-state";
export const dynamic = "force-dynamic";
function interactiveProduct(p: import("@/lib/shopware/types").Product) {
  return {
    id: p.id,
    productNumber: p.productNumber,
    parentId: p.parentId,
    name: p.name,
    translated: {
      name: p.translated?.name,
      description: p.translated?.description,
    },
    cover: p.cover,
    media: p.media,
    options: p.options,
    calculatedPrice: p.calculatedPrice,
    available: p.available,
    deliveryTime: p.deliveryTime,
    manufacturer: p.manufacturer,
  };
}
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
    <>
      <Container>
        <Breadcrumbs
          items={[{ label: "Produkte", href: "/produkte" }, { label: name }]}
        />
      </Container>
      <ProductExperience
        product={interactiveProduct(product)}
        variants={(variants || []).map(interactiveProduct)}
        currency={context.currency.isoCode}
        taxState={context.taxState}
        description={plainText(product.translated?.description) || ""}
        imageDownloads={<ProductDownloads product={product} />}
      >
        {approvedTextures[product.id] && (
          <Container>
            <TextLink href={`${visualizerPath}?produkt=${product.id}`}>
              An meiner Wand ansehen
            </TextLink>
          </Container>
        )}
        <ProductResources product={product} />
      </ProductExperience>
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
    </>
  );
}
