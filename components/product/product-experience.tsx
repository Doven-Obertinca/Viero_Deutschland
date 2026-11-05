"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, type ReactNode, type CSSProperties } from "react";
import type { Product } from "@/lib/shopware/types";
import { productName, productPath } from "@/lib/shopware/urls";
import {
  colourPreview,
  isColour,
  matchingVariant,
  panelInk,
  type ProductOption,
} from "@/lib/content/product-colours";
import { ProductSelection } from "./product-specifications";
import { ProductPrice, ProductBadge } from "./products";
import styles from "./product-experience.module.css";
export function ProductExperience({
  product,
  variants,
  currency,
  taxState,
  description,
  children,
  imageDownloads,
}: {
  product: Product;
  variants: Product[];
  currency: string;
  taxState?: string;
  description: string;
  children?: ReactNode;
  imageDownloads?: ReactNode;
}) {
  const initial = product.parentId
    ? product
    : variants.find((v) => v.available !== false) || product;
  const [chosen, setChosen] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (initial.options || []).map((o) => [o.group?.name || "Ausführung", o.id]),
    ),
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const lightbox = useRef<HTMLDialogElement>(null);
  const imageTrigger = useRef<HTMLButtonElement>(null);
  const groups = new Map<string, ProductOption[]>();
  for (const variant of [product, ...variants])
    for (const option of variant.options || []) {
      const name = option.group?.name || "Ausführung";
      const options = groups.get(name) || [];
      if (!options.some((o) => o.id === option.id)) options.push(option);
      groups.set(name, options);
    }
  const selected = matchingVariant(variants, chosen) || product;
  const colourGroups = [...groups].filter(([, options]) =>
    options.some(isColour),
  );
  const selectedColour = colourGroups
    .flatMap(([, options]) => options)
    .find((o) => Object.values(chosen).includes(o.id));
  const preview = colourPreview(selectedColour);
  const images = [
    selected.cover?.media,
    ...(selected.media || []).map((m) => m.media),
    product.cover?.media,
    ...(product.media || []).map((m) => m.media),
  ]
    .filter(
      (m): m is NonNullable<typeof m> =>
        !!m &&
        (!m.mimeType || m.mimeType.startsWith("image/")) &&
        !/\.(?:pdf|mp4|webm)(?:\?|$)/i.test(m.url),
    )
    .filter((m, i, a) => a.findIndex((other) => other.url === m.url) === i);
  const activeImage = images[imageIndex] || images[0];
  function choose(group: string, option: ProductOption) {
    const next = { ...chosen, [group]: option.id };
    if (!matchingVariant(variants, next)) {
      const fallback = variants.find((v) =>
        v.options?.some((o) => o.id === option.id),
      );
      if (fallback)
        for (const o of fallback.options || [])
          next[o.group?.name || "Ausführung"] = o.id;
    }
    setChosen(next);
    setImageIndex(0);
    setFailed(false);
  }
  return (
    <ProductSelection.Provider value={selected}>
      <article
        className={styles.experience}
        style={
          {
            "--panel-colour": preview.colour,
            "--panel-ink": panelInk(preview.colour),
          } as CSSProperties
        }
      >
        <div className={styles.visual}>
          <Link href="/produkte" className={styles.back}>
            VIERO / KOLLEKTION
          </Link>
          <div className={styles.imageStage}>
            {activeImage && !failed ? (
              <Image
                key={activeImage.url}
                src={activeImage.url}
                alt={activeImage.alt || productName(product)}
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
                preload
                onError={() => setFailed(true)}
              />
            ) : (
              <span>Abbildung nicht verfügbar</span>
            )}
            {activeImage && !failed && (
              <button
                ref={imageTrigger}
                type="button"
                className={styles.expandImage}
                aria-label="Produktbild vergrößern"
                onClick={() => lightbox.current?.showModal()}
              >
                <span aria-hidden="true">+</span> Bild vergrößern
              </button>
            )}
          </div>
          <div className={styles.imageCaption}>
            <span>
              {productName(product)}
              <small>VIERO / MATERIAL STUDY</small>
            </span>
            <span>
              {String(imageIndex + 1).padStart(2, "0")} /{" "}
              {String(Math.max(images.length, 1)).padStart(2, "0")}
            </span>
          </div>
          <div className={styles.visualFoot}>
            <span>ITALIAN SURFACE CULTURE</span>
            {images.length > 1 && (
              <div className={styles.imageControls} aria-label="Produktbilder">
                {images.map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    aria-label={`Bild ${index + 1} anzeigen`}
                    aria-pressed={imageIndex === index}
                    onClick={() => {
                      setImageIndex(index);
                      setFailed(false);
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
            )}
          </div>
          {imageDownloads}
        </div>
        <div className={styles.swatches}>
          {colourGroups.length ? (
            colourGroups.map(([group, options]) => (
              <fieldset key={group}>
                <legend>{group.split("|")[0].trim()}</legend>
                <div className={styles.swatchList}>
                  {options.map((option) => {
                    const swatch = colourPreview(option);
                    return (
                      <label
                        key={option.id}
                        className={styles.swatch}
                        title={option.name || "Farbton"}
                        style={{ "--swatch": swatch.colour } as CSSProperties}
                      >
                        <input
                          type="radio"
                          name={`colour-${group}`}
                          value={option.id}
                          checked={chosen[group] === option.id}
                          onChange={() => choose(group, option)}
                        />
                        <span className={styles.dot} aria-hidden="true" />
                        <span className={styles.swatchName}>{option.name}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))
          ) : (
            <span className={styles.noSwatches}>
              VIERO
              <br />
              MATERIAL
            </span>
          )}
        </div>
        <div className={styles.details}>
          <p className={styles.eyebrow}>
            {product.manufacturer?.name || "VIERO"} / DECORATIVES
          </p>
          <div className={styles.titleBlock}>
            <span className={styles.index}>
              MATERIAL / {selectedColour?.name || "ORIGINAL"}
            </span>
            <h1>{productName(product)}</h1>
          </div>
          <div className={styles.summary}>
            {description.split(/(?<=[.!?])\s/)[0] || description.slice(0, 250)}
          </div>
          {[...groups]
            .filter(([, options]) => !options.some(isColour))
            .map(([group, options]) => (
              <fieldset className={styles.sizes} key={group}>
                <legend>{group}</legend>
                <div>
                  {options.map((option) => (
                    <label key={option.id}>
                      <input
                        type="radio"
                        name={`option-${group}`}
                        checked={chosen[group] === option.id}
                        onChange={() => choose(group, option)}
                      />
                      <span>{option.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          <div
            className={styles.purchase}
            aria-live="polite"
            aria-atomic="true"
          >
            <ProductPrice
              product={selected}
              currency={currency}
              taxState={taxState}
            />
            <ProductBadge product={selected} />
            <p className={styles.sku}>ART. {selected.productNumber}</p>
          </div>
          <Link className={styles.enquire} href="/showroom#beratung">
            Materialberatung anfragen
          </Link>
          {selectedColour && (
            <p className={styles.colourNote}>
              {preview.unavailable
                ? "Für diesen Farbcode ist keine digitale Farbvorschau hinterlegt."
                : "Digitale Farbannäherung. Verbindlich ist das Originalmuster."}
            </p>
          )}
          <details className={styles.description}>
            <summary>
              Material & Eigenschaften <span aria-hidden="true">+</span>
            </summary>
            <p>
              {description ||
                "Eine Produktbeschreibung ist derzeit nicht hinterlegt."}
            </p>
          </details>
          <div className={styles.detailFoot}>
            <span>MADE IN ITALY.</span>
            {selected.id !== product.id && (
              <Link href={productPath(selected)}>Ausführung öffnen</Link>
            )}
          </div>
        </div>
        <dialog
          ref={lightbox}
          className={styles.lightbox}
          aria-label={`${productName(product)} – Bildansicht`}
          onClick={(event) => {
            if (event.target === lightbox.current) lightbox.current?.close();
          }}
          onClose={() => imageTrigger.current?.focus({ preventScroll: true })}
        >
          <div className={styles.lightboxBar}>
            <span>{productName(product)} / VIERO</span>
            <button
              type="button"
              autoFocus
              onClick={() => lightbox.current?.close()}
            >
              Schließen <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className={styles.fullImage}>
            {activeImage && (
              <Image
                src={activeImage.url}
                alt={activeImage.alt || productName(product)}
                fill
                sizes="95vw"
                style={{ objectFit: "contain" }}
              />
            )}
          </div>
        </dialog>
      </article>
      {children}
    </ProductSelection.Provider>
  );
}
