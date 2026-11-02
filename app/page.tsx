import { SignatureHero } from "@/components/home/signature-hero";
import { ProductShowcase } from "@/components/home/product-showcase";
import { metadata as pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Viero Deutschland", "/");
export const dynamic = "force-dynamic";
export default function Home() {
  return (
    <>
      <SignatureHero />
      <ProductShowcase />
    </>
  );
}
