"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./tinting.module.css";
export const originalTintVideo =
  "https://viero-deutschland.de/media/6b/29/c7/1701240018/labor.mp4";
export function TintingHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (motion.matches) {
        video.current?.pause();
        setEnabled(false);
        setPlaying(false);
      } else {
        const connection = (
          navigator as Navigator & { connection?: { saveData?: boolean } }
        ).connection;
        if (!connection?.saveData) setEnabled(true);
      }
    };
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);
  const toggle = () => {
    if (!enabled) {
      setEnabled(true);
      return;
    }
    if (video.current?.paused)
      video.current.play().catch(() => setPlaying(false));
    else video.current?.pause();
  };
  return (
    <section className={styles.hero} aria-labelledby="tint-hero-title">
      <Image
        className={styles.poster}
        src="/brand/tinting/labor-poster.jpg"
        alt="Einblick in das Viero Tönungslabor"
        fill
        priority
        sizes="100vw"
      />
      {enabled && (
        <video
          ref={video}
          className={styles.heroVideo}
          src={originalTintVideo}
          muted
          autoPlay
          loop
          playsInline
          preload="none"
          poster="/brand/tinting/labor-poster.jpg"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setEnabled(false);
            setPlaying(false);
          }}
        />
      )}
      <div className={styles.heroShade} />
      <div className={styles.heroContent}>
        <p className={styles.label}>VIERO / TÖNUNGS-SERVICE</p>
        <h1 id="tint-hero-title">
          Farbe.
          <br />
          <span>Ohne Grenzen.</span>
        </h1>
        <div className={styles.heroBottom}>
          <p>
            Individuelle Farbtöne für außergewöhnliche Oberflächen. Entdecken
            Sie die Möglichkeiten unseres Tönungs-Services.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#farben">
              Farben entdecken <span aria-hidden="true">＋</span>
            </a>
            <a className={styles.textLink} href="#anfrage">
              Tönung anfragen
            </a>
          </div>
        </div>
      </div>
      <div className={styles.heroFoot}>
        <a href="#farben">
          01 / DIE WELT DER NUANCEN <span aria-hidden="true">↓</span>
        </a>
        <button
          onClick={toggle}
          aria-label={
            playing
              ? "Hintergrundvideo pausieren"
              : "Hintergrundvideo abspielen"
          }
        >
          {playing ? "Ⅱ Pause" : "▷ Film abspielen"}
        </button>
      </div>
    </section>
  );
}
