import { VisualizerCampaign } from "@/components/home/visualizer-campaign";
import { mapVisualizerMaterials } from "@/lib/visualizer/catalog-mapping";
import { SignatureHero } from "@/components/home/signature-hero";
import { ProductShowcase } from "@/components/home/product-showcase";
import { WallFinishes } from "@/components/home/wall-finishes";
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
  const products = getCatalogProducts();
  const searchItems = products.then(buildCatalog).catch(() => undefined);
  return (
    <>
      <ProductSearch items={searchItems} />
      <SignatureHero />
      <VisualizerCampaign
        materials={products
          .then((items) =>
            mapVisualizerMaterials(items)
              .filter((item) => item.texture)
              .slice(0, 3),
          )
          .catch(() => [])}
      />
      <ProductShowcase />
      <WallFinishes items={searchItems} products={products} />
      <MaterialCulture />
      <ArchitecturalLookbook />
      <Showroom />
    </>
  );
}
