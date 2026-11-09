import { SignatureHero } from "@/components/home/signature-hero";
import { ProductShowcase } from "@/components/home/product-showcase";
import { MaterialCulture } from "@/components/home/material-culture";
import { ArchitecturalLookbook } from "@/components/home/architectural-lookbook";
import { ProductSearch } from "@/components/home/product-search";
import { Showroom } from "@/components/home/showroom";
import { metadata as pageMetadata } from "@/lib/seo";
import { buildCatalog } from "@/lib/catalog/filters";
import { getCatalogProducts } from "@/lib/shopware/products";
export const metadata = pageMetadata("Viero Deutschland", "/");
export const dynamic = "force-dynamic";

export default function Home() {
  const searchItems = getCatalogProducts()
    .then(buildCatalog)
    .catch(() => undefined);
  return (
    <>
      <ProductSearch items={searchItems} />
      <SignatureHero />
      <ProductShowcase />
      <MaterialCulture />
      <ArchitecturalLookbook />
      <Showroom />
    </>
  );
}
