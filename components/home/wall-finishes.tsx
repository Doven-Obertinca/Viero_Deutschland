import Image from "next/image";
import Link from "next/link";
import type { CatalogItem } from "@/lib/catalog/filters";
import { showcaseProductIds } from "@/lib/home/showcase";
import { getContext } from "@/lib/shopware/context";
import type { Product } from "@/lib/shopware/types";
import styles from "./wall-finishes.module.css";

const cardPhotos: Record<string, { src: string; alt: string }> = {
  "019091a18051717ca7e33783dbabb651": {
    src: "/brand/wall-finishes/allure-damascato.webp",
    alt: "Goldgelbe Wand mit schimmernder Allure-Damascato-Struktur",
  },
  "0190a15886267e59a54d7152d79fff7f": {
    src: "/brand/about/gallery/2.webp",
    alt: "Graue Marmorin-Hydro-Wand mit freistehendem Waschbecken",
  },
};

export async function WallFinishes({
  items,
  products,
}: {
  items: Promise<CatalogItem[] | undefined>;
  products: Promise<Product[]>;
}) {
  const catalog = await items;
  if (!catalog?.length) return null;

  const [source, context] = await Promise.all([
    products,
    getContext().catch(() => undefined),
  ]);
  const bestsellers = new Set(
    source
      .filter((product) => product.markAsTopseller === true)
      .map((product) => product.parentId ?? product.id),
  );
  const byId = new Map(catalog.map((item) => [item.id, item]));
  const featured = showcaseProductIds
    .map((id) => byId.get(id))
    .filter((item): item is CatalogItem & { image: string } =>
      Boolean(item?.image && item.available !== false),
    )
    .sort(
      (a, b) => Number(bestsellers.has(b.id)) - Number(bestsellers.has(a.id)),
    )
    .slice(0, 4);
  if (!featured.length) return null;

  const money =
    context &&
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: context.currency.isoCode,
    });

  return (
    <section className={styles.section} aria-labelledby="wall-finishes-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className="eyebrow">VIERO DECORATIVES</p>
            <h2 id="wall-finishes-title">Dekorative Wandoberflächen</h2>
          </div>
        </header>
        <div className={styles.grid}>
          {featured.map((item) => (
            <article key={item.id}>
              <Link href={item.href} prefetch={false} className={styles.card}>
                <div className={styles.visual}>
                  <Image
                    className={
                      item.id === "019091a18051717ca7e33783dbabb651"
                        ? styles.allureCrop
                        : undefined
                    }
                    src={cardPhotos[item.id]?.src ?? item.image}
                    alt={cardPhotos[item.id]?.alt ?? item.alt}
                    quality={90}
                    fill
                    sizes="(max-width: 700px) 44vw, 22vw"
                  />
                  {bestsellers.has(item.id) && (
                    <span className={styles.badge}>Bestseller</span>
                  )}
                </div>
                <h3>{item.name}</h3>
                <p>{item.subtitle}</p>
                {money && item.price !== undefined && (
                  <p className={styles.price}>ab {money.format(item.price)}</p>
                )}
              </Link>
            </article>
          ))}
        </div>
        <div className={styles.actions}>
          <Link className="button" href="/produkte">
            Alle Produkte ansehen
          </Link>
        </div>
      </div>
    </section>
  );
}
