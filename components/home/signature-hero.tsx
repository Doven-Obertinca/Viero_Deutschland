import { getProduct } from "@/lib/shopware/products";
import { productName, productPath } from "@/lib/shopware/urls";
import { plainText } from "@/lib/seo";
import { ProductStory } from "./product-story";

// Editorial selection only: all names, images and links remain sourced from Shopware.
const heroProductIds = [
  "019091c88eea72e5b497a64162ab435f", // Erametal
  "0190a131fa207e42a5b0e5b472018a54", // Marmorin
  "01915fac45d375b897801e81f3ef38f1", // Scaglie Decorative
];

export async function SignatureHero() {
  const details = await Promise.allSettled(
    heroProductIds.map((id) => getProduct(id)),
  );
  const products = details.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const product = result.value;
    const media = product.cover?.media;
    if (!media) return [];
    return [
      {
        id: product.id,
        name: productName(product),
        href: productPath(product),
        image: media.url,
        alt: media.alt || `${productName(product)} – Viero Oberfläche`,
        description: plainText(product.translated?.description) || "",
      },
    ];
  });
  return <ProductStory products={products} />;
}
