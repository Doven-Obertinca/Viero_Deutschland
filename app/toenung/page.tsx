import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCatalogProducts } from "@/lib/shopware/products";
import { buildTintCatalog, type TintCatalog } from "@/lib/tinting/model";
import { metadata as pageMetadata, jsonLd } from "@/lib/seo";
import { architecturalSpaces } from "@/lib/home/spaces";
import { TintingHero } from "@/components/tinting/tinting-hero";
import { TintingExperience } from "@/components/tinting/tinting-experience";
import styles from "@/components/tinting/tinting.module.css";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Tönungs-Service – Farbe ohne Grenzen",
  "/toenung",
  "Viero Farbtöne entdecken, Materialien erkunden und individuelle Tönungen unverbindlich anfragen. Mit Farbreferenz, Materialstudio und persönlicher Beratung.",
);
async function TintWorkspace() {
  let catalog: TintCatalog;
  try {
    catalog = buildTintCatalog(await getCatalogProducts());
  } catch {
    catalog = { available: false, colours: [], materials: [] };
  }
  return <TintingExperience catalog={catalog} />;
}
export default function TintingPage() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Viero Deutschland Tönungs-Service",
            description:
              "Individuelle Farbtonanfragen und Beratung zu dekorativen Oberflächen.",
            url: "/toenung",
            provider: { "@type": "Organization", name: "Viero Deutschland" },
          }),
        }}
      />
      <TintingHero />
      <nav className={styles.chapterNav} aria-label="Tönungs-Service Kapitel">
        <a href="#farben">Farben</a>
        <a href="#studio">Materialstudio</a>
        <a href="#farbreferenz">Farbabgleich</a>
        <a href="#farbprojekt">Farbprojekte</a>
        <a href="#anfrage">
          Tönung anfragen <span aria-hidden="true">＋</span>
        </a>
      </nav>
      <div className={styles.manifesto}>
        <p className={styles.label}>DIE FREIHEIT, INDIVIDUELL ZU GESTALTEN.</p>
        <p>
          Zwischen einer Idee
          <br />
          und einem Raum liegt
          <br />
          <span>die richtige Nuance.</span>
        </p>
        <small>
          Farbe ist Licht. Farbe ist Material. Farbe ist eine persönliche
          Entscheidung. Wir begleiten Sie von der ersten Inspiration bis zur
          abgestimmten Oberfläche.
        </small>
      </div>
      <Suspense
        fallback={
          <section className={styles.section} role="status">
            Farben und Materialien werden geladen …
          </section>
        }
      >
        <TintWorkspace />
      </Suspense>
      <section
        className={`${styles.section} ${styles.inspiration}`}
        aria-labelledby="inspiration-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.label}>07 / INSPIRATION</p>
          <h2 id="inspiration-title">
            Farbe
            <br />
            <span>im Raum.</span>
          </h2>
          <p>
            Aus dem offiziellen Viero Referenzarchiv. Reale Räume, individuelle
            Oberflächen. Die genaue Farbrezeptur ist nicht hinterlegt.
          </p>
        </div>
        <div className={styles.inspirationGrid}>
          {[
            architecturalSpaces[2],
            architecturalSpaces[0],
            architecturalSpaces[1],
          ].map((space, index) => (
            <figure key={space.slug}>
              <a href={space.href} target="_blank" rel="noopener">
                <Image
                  src={`/brand/spaces/${space.slug}.webp`}
                  alt={space.alt}
                  width={space.width}
                  height={space.height}
                  sizes={
                    index === 0
                      ? "(max-width: 767px) 92vw, 60vw"
                      : "(max-width: 767px) 92vw, 35vw"
                  }
                />
              </a>
              <figcaption>
                <div>
                  <span>{space.title}</span>
                  <small>{space.finish} · Viero Referenzprojekt</small>
                </div>
                <Link className={styles.textLink} href="/produkte">
                  Material entdecken ＋
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section
        className={`${styles.section} ${styles.process}`}
        aria-labelledby="process-title"
      >
        <p className={styles.label}>08 / VON DER IDEE ZUR FARBE</p>
        <h2 id="process-title">
          Ein gemeinsamer Weg.
          <br />
          <span>Ihre Oberfläche.</span>
        </h2>
        <ol>
          {[
            {
              title: "Farbe definieren.",
              text: "Eine Katalogfarbe, ein vorhandener Farbcode oder ein Bild. Ihre Referenz ist der Ausgangspunkt.",
            },
            {
              title: "Möglichkeiten prüfen.",
              text: "Unser Team prüft den Wunschfarbton im Zusammenspiel mit Material, Untergrund und Einsatzbereich.",
            },
            {
              title: "Oberfläche gestalten.",
              text: "Nach persönlicher Bestätigung kann die passende Tönungslösung für Ihr Projekt vorbereitet werden.",
            },
          ].map((step, index) => (
            <li key={step.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <a className={styles.primary} href="#anfrage">
          Über Ihre Idee sprechen <span aria-hidden="true">＋</span>
        </a>
      </section>
    </div>
  );
}
