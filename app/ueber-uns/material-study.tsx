"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import styles from "./about.module.css";

export function MaterialStudy() {
  const [reveal, setReveal] = useState(38);

  return (
    <figure className={styles.study}>
      <div
        className={styles.studyImages}
        style={{ "--reveal": `${reveal}%` } as CSSProperties}
      >
        <Image
          src="/brand/about/dubai-apartment.jpg"
          alt="Wohnraum mit horizontal strukturierter Wand und Ledersofa"
          fill
          quality={90}
          sizes="(min-width: 1440px) 1440px, 100vw"
        />
        <Image
          className={styles.studyTexture}
          src="/brand/about/plaster-detail.jpg"
          alt="Nahaufnahme einer dunklen, reliefartigen Putzoberfläche"
          fill
          quality={90}
          sizes="(min-width: 1440px) 1440px, 100vw"
        />
        <span className={styles.studyLine} aria-hidden="true" />
      </div>
      <figcaption className={styles.studyControl}>
        <span>Raum</span>
        <input
          type="range"
          min="0"
          max="100"
          value={reveal}
          onChange={(event) => setReveal(Number(event.target.value))}
          aria-label="Bildübergang zwischen Raum und Material"
          aria-valuetext={`${reveal} % Material, ${100 - reveal} % Raum`}
        />
        <span>Material</span>
      </figcaption>
    </figure>
  );
}
