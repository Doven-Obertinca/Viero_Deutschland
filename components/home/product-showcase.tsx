import Image from "next/image";
import Link from "next/link";
import { getShowcaseProducts } from "@/lib/home/showcase";
import { productName, productPath } from "@/lib/shopware/urls";
import { plainText } from "@/lib/seo";
import { ShowcaseScroll } from "./showcase-scroll";
import styles from "./product-showcase.module.css";

export async function ProductShowcase() {
  const products = await getShowcaseProducts();
  return (
    <section className={styles.section} aria-labelledby="surfaces-title">
      <div className={`container ${styles.intro}`}>
        <p className="eyebrow">OBERFLÄCHEN</p>
        <h2 id="surfaces-title">Materialien, die Räume prägen.</h2>
        <p className={styles.introCopy}>
          Mineralische Strukturen, natürliche Tiefe und italienische
          Materialkultur. Entdecken Sie VIERO Oberfläche für Oberfläche.
        </p>
      </div>
      {products.length ? (
        <ShowcaseScroll count={products.length}>
          {products.map((product, index) => {
            const name = productName(product);
            const media = product.cover!.media!;
            const category = product.categories?.[0];
            const description = plainText(product.translated?.description);
            // The opening catalogue paragraph is the finish's own descriptor.
            const openingHtml =
              product.translated?.description?.split(/<div[\s>]/i)[0] || "";
            const excerpt = [
              plainText(openingHtml),
              ...Array.from(
                openingHtml.matchAll(/<b\b[^>]*>([\s\S]*?)<\/b>/gi),
                (match) => plainText(match[1]),
              ),
            ].find((text) => text && text.length >= 20 && text.length <= 120);
            const detail = description?.startsWith(excerpt || "\0")
              ? description.slice(excerpt!.length).trim()
              : description;
            const applications = [
              [/badezimmer|duschkabinen/i, "Badezimmer"],
              [/küche/i, "Küche"],
              [/wohnbereich|wohnzimmer/i, "Wohnbereich"],
              [/treppenhaus/i, "Treppenhaus"],
              [/innen- und außenbereich/i, "Innen- und Außenbereich"],
              [/für innenräume/i, "Innenräume"],
            ] as const;
            const uses = applications
              .filter(([pattern]) => pattern.test(description || ""))
              .map(([, label]) => label)
              .join(" · ");
            return (
              <article
                className={styles.product}
                key={product.id}
                data-showcase-product
                aria-labelledby={`surface-${product.id}`}
              >
                <Link
                  className={styles.surfaceLink}
                  href={productPath(product)}
                  prefetch={false}
                  aria-label={`${name} – Produkt entdecken`}
                  aria-describedby={
                    detail ? `surface-detail-${product.id}` : undefined
                  }
                >
                  <div className={styles.meta}>
                    <span className={styles.number}>
                      {String(index + 1).padStart(2, "0")}
                      <span> / {String(products.length).padStart(2, "0")}</span>
                    </span>
                    {category && (
                      <span className={styles.category}>
                        {category.translated?.name || category.name}
                      </span>
                    )}
                  </div>
                  <div className={styles.visual}>
                    <Image
                      src={media.url}
                      alt={
                        media.alt ||
                        `${name} – VIERO ${category?.translated?.name || category?.name || "Oberfläche"}`
                      }
                      fill
                      sizes="(min-width: 900px) 48vw, 90vw"
                      loading="lazy"
                    />
                    <span className={styles.imageError}>
                      Abbildung derzeit nicht verfügbar
                    </span>
                  </div>
                  <div className={styles.caption}>
                    <h3 id={`surface-${product.id}`}>{name}</h3>
                    {uses && <p className={styles.applications}>{uses}</p>}
                    {detail && (
                      <p
                        className={styles.detail}
                        id={`surface-detail-${product.id}`}
                      >
                        {detail.length > 320
                          ? `${detail.slice(0, 320).replace(/\s+\S*$/, "")} …`
                          : detail}
                      </p>
                    )}
                    <span className={styles.discover}>Produkt entdecken</span>
                  </div>
                </Link>
              </article>
            );
          })}
        </ShowcaseScroll>
      ) : (
        <p className={`container ${styles.unavailable}`}>
          Die Materialauswahl ist vorübergehend nicht verfügbar.{" "}
          <Link href="/produkte">Zum Produktkatalog</Link>
        </p>
      )}
    </section>
  );
}
