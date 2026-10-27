import { SignatureHero } from "@/components/home/signature-hero";
import { Container } from "@/components/ui/primitives";
import { metadata as pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Viero Deutschland", "/");
export const dynamic = "force-dynamic";
export default function Home() {
  return (
    <>
      <SignatureHero />
      <Container>
        <section className="section editorial home-editorial">
          <p className="eyebrow">MATERIAL. RAUM. AUSDRUCK.</p>
          <h2>
            Die Signatur italienischer
            <br />
            Raumgestaltung.
          </h2>
          <p>
            Entdecken Sie den Viero Produktkatalog für dekorative Wand- und
            Bodenoberflächen.
          </p>
        </section>
      </Container>
    </>
  );
}
