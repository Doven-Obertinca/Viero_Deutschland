"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./academy.module.css";

export function AcademyVideo({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (motion.matches) element.pause();
      else void element.play().catch(() => {});
    };
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, [src]);

  return (
    <>
      <video
        ref={video}
        src={src}
        poster="/brand/akademie/poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        className={styles.playback}
        type="button"
        aria-label={playing ? "Video pausieren" : "Video abspielen"}
        onClick={() => {
          const element = video.current;
          if (!element) return;
          if (element.paused) void element.play().catch(() => {});
          else element.pause();
        }}
      >
        <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
      </button>
    </>
  );
}
