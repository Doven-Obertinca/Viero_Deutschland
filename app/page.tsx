import { SignatureHero } from "@/components/home/signature-hero";
import { ProductShowcase } from "@/components/home/product-showcase";
import { MaterialCulture } from "@/components/home/material-culture";
import { ArchitecturalLookbook } from "@/components/home/architectural-lookbook";
import { Showroom } from "@/components/home/showroom";
import { metadata as pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Viero Deutschland", "/");
export const dynamic = "force-dynamic";
export default function Home() {
  return (
    <>
      <SignatureHero />
      <ProductShowcase />
      <MaterialCulture />
      <ArchitecturalLookbook />
      <Showroom />
    </>
  );
}
