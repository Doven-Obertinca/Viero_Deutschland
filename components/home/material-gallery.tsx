"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./material-culture.module.css";

const photos = [
  ["copper", "Kupferfarbene Oberfläche mit blauen und grünen Patinaspuren"],
  [
    "copper-2",
    "Seitlicher Blick auf schimmernde Kupferstruktur und blaue Patina",
  ],
  ["copper-3", "Nahaufnahme des körnigen Kupferreliefs im Streiflicht"],
] as const;

export function MaterialGallery() {
  const [active, setActive] = useState(0);

  return (
    <figure
      className={styles.materialFigure}
      aria-label="Kupferoberfläche in drei Ansichten"
    >
      <div className={styles.materialReveal}>
        <div className={styles.materialCallout}>
          <span>Terre Etrusche · Copper</span>
        </div>
        {photos.map(([name, alt], index) => (
          <button
            type="button"
            key={name}
            className={styles.materialSlide}
            data-active={index === active}
            data-depth={(index - active + photos.length) % photos.length}
            aria-label={
              index === active
                ? `Nächste Ansicht. Aktuell: ${alt}`
                : `Ansicht 0${index + 1}: ${alt}`
            }
            onClick={() =>
              setActive(index === active ? (active + 1) % photos.length : index)
            }
          >
            <Image
              src={`/brand/material-culture/${name}.webp`}
              alt=""
              width={2580}
              height={3000}
              quality={90}
              sizes="(max-width: 639px) 98vw, (max-width: 959px) 59vw, (min-width: 1800px) 900px, 50vw"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <figcaption>
        01 — Struktur im Detail. Licht auf der Oberfläche.
      </figcaption>
    </figure>
  );
}
