"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./signature-hero.module.css";

type StoryProduct = {
  id: string;
  name: string;
  href: string;
  image: string;
  alt: string;
  description: string;
};
export function ProductStory({ products }: { products: StoryProduct[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const count = Math.max(products.length, 1);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = root.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const travel = node.offsetHeight - node.firstElementChild!.clientHeight;
      const progress =
        travel > 0 ? Math.max(0, Math.min(1, -rect.top / travel)) : 0;
      setActive(Math.min(count - 1, Math.floor(progress * count)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [count]);
  function select(index: number) {
    const node = root.current;
    if (!node) return;
    const top = window.scrollY + node.getBoundingClientRect().top;
    const travel = node.offsetHeight - node.firstElementChild!.clientHeight;
    window.scrollTo({
      top: top + (index === 0 ? 0 : ((index + 0.3) / count) * travel),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  const product = products[active];
  const description =
    product?.description ||
    "Italienische Gestaltung. Dekorative Oberflächen für Räume mit Charakter.";
  const excerpt =
    description.length > 190
      ? `${description.slice(0, 190).replace(/\s+\S*$/, "")} …`
      : description;
  return (
    <section
      ref={root}
      className={`signature-hero ${styles.hero}`}
      style={{ "--story-count": count } as React.CSSProperties}
      aria-label="Viero Materialwelten"
    >
      <div className={styles.sticky}>
        <div className={styles.stage}>
          <div className={styles.circle} aria-hidden="true" />
          <div className={styles.copy}>
            <p className={styles.index}>
              VIERO DECORATIVES / {String(active + 1).padStart(2, "0")}
            </p>
            <p className={styles.description}>{excerpt}</p>
            <Link
              className={styles.explore}
              href={product?.href || "/produkte"}
            >
              {product ? `${product.name} entdecken` : "Kollektion entdecken"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <h1 className={styles.title}>
            <span>Mehr als</span>
            <span>Farbe.</span>
          </h1>
          <div className={styles.artwork}>
            {products.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                aria-label={`${item.name} entdecken`}
                aria-hidden={index !== active}
                tabIndex={index === active ? 0 : -1}
                className={styles.productImage}
                data-active={index === active}
                inert={index !== active}
              >
                {!failedImages.includes(item.id) ? (
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 72vw, 40vw"
                    onError={() =>
                      setFailedImages((previous) => [...previous, item.id])
                    }
                  />
                ) : (
                  <span className={styles.imageFallback}>{item.name}</span>
                )}
              </Link>
            ))}
            {!products.length && (
              <span className={styles.imageFallback}>Viero Decoratives</span>
            )}
          </div>
          <div className={styles.materialI} aria-hidden="true">
            {[styles.materialDot, styles.materialStem].map((part) => (
              <div className={part} key={part}>
                {products.map((item, index) => (
                  <span
                    className={styles.materialSlice}
                    key={item.id}
                    data-active={index === active}
                  >
                    {!failedImages.includes(item.id) && (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="10vw"
                        style={{
                          objectFit: "cover",
                          objectPosition: "85% center",
                        }}
                      />
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.baseline}>
            <nav className={styles.steps} aria-label="Produkte im Überblick">
              {products.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => select(index)}
                  aria-label={`${item.name} anzeigen`}
                  aria-pressed={active === index}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.stepName}>{item.name}</span>
                </button>
              ))}
            </nav>
            <p
              className={styles.productLabel}
              aria-live="polite"
              aria-atomic="true"
            >
              {product?.name || "Viero"}
              <span>Made in Italy.</span>
            </p>
          </div>
          <span className={styles.scrollHint} aria-hidden="true">
            SCROLL TO DISCOVER <span>↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}
