"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./about.module.css";

const photos = [
  ["Marmorin Extra", "Blaue Spachtelwand mit Stühlen in einem hellen Atelier"],
  [
    "Marmorin Hydro",
    "Graue Wand mit freistehendem Waschbecken und Bücherregal",
  ],
  ["Marmorin Hydro", "Hellgrüne Wand mit Pendelleuchten und blauen Stoffen"],
  ["Marmorin Hydro", "Detail des Waschbeckens vor einer grauen Spachtelwand"],
  ["Marmorin Sand", "Sandfarbene Wandstruktur an einer runden Öffnung"],
  ["Mithos Lux · Veneziano", "Goldgelbe Wand neben zwei hängenden Holzstühlen"],
  ["Silk · Seta", "Türkisfarbener Sessel vor einer seidig schimmernden Wand"],
  ["Travertine", "Beleuchtete Travertinwand mit Spiegel und Beistelltisch"],
  ["Travertine", "Travertinstruktur im Streiflicht neben einem dunklen Stuhl"],
  ["Vieroplast · Corduroy", "Schneiderpuppe vor einer gerillten Wand"],
] as const;

const groupStarts = [0, 3, 6, 9] as const;

export function InteriorGallery() {
  const [active, setActive] = useState(0);
  const start = groupStarts[active];
  const end = groupStarts[active + 1] ?? photos.length;

  return (
    <section
      id="materialgalerie"
      className={styles.gallery}
      aria-labelledby="interior-gallery-title"
    >
      <header className={styles.galleryHeader}>
        <div>
          <p className={styles.kicker}>Viero / Materialgalerie</p>
          <h2 id="interior-gallery-title">Oberflächen im Raum</h2>
        </div>
        <div
          className={styles.gallerySwitch}
          role="group"
          aria-label="Bildserie auswählen"
        >
          {groupStarts.map((first, index) => (
            <button
              key={first}
              type="button"
              aria-label={`Bildserie ${index + 1} von ${groupStarts.length}`}
              aria-controls="materialgalerie-bilder"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <svg
                viewBox="0 0 20 20"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <rect x="2.5" y="4.5" width="3" height="11" rx="0.6" />
                <rect x="8.5" y="4.5" width="3" height="11" rx="0.6" />
                <rect x="14.5" y="4.5" width="3" height="11" rx="0.6" />
              </svg>
            </button>
          ))}
        </div>
      </header>
      <div
        id="materialgalerie-bilder"
        key={active}
        className={styles.galleryGrid}
      >
        {photos.slice(start, end).map(([title, alt], index) => (
          <figure key={alt}>
            <div className={styles.galleryArt}>
              <Image
                src={`/brand/about/gallery/${start + index + 1}.webp`}
                alt={alt}
                fill
                quality={90}
                sizes="(max-width: 640px) 42vw, 30vw"
                loading={active === 0 ? "lazy" : "eager"}
              />
            </div>
            <figcaption>
              <span>{String(start + index + 1).padStart(2, "0")}</span>
              {title}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className={styles.galleryCount} aria-live="polite">
        Ansichten {start + 1}
        {end > start + 1 ? `–${end}` : ""} / {photos.length}
      </p>
    </section>
  );
}
