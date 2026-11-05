"use client";
import { useState } from "react";
import type { ProductVideo } from "@/lib/content/product-resources";
import styles from "./product-resources.module.css";
export function ProductVideoPlayer({
  video,
  name,
  index,
}: {
  video: ProductVideo;
  name: string;
  index: number;
}) {
  const [loaded, setLoaded] = useState(false);
  if (video.type === "file")
    return (
      <video
        controls
        preload="none"
        className={styles.player}
        aria-label={`${name} – Produktvideo ${index + 1}`}
        src={video.url}
      />
    );
  const src =
    video.type === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${video.id}?rel=0`
      : `https://player.vimeo.com/video/${video.id}?dnt=1`;
  return (
    <div className={styles.video}>
      {loaded ? (
        <iframe
          className={styles.player}
          src={src}
          title={`${name} – Produktvideo ${index + 1}`}
          allow="fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className={styles.videoCover}>
          <span className={styles.videoNumber}>
            FILM / {String(index + 1).padStart(2, "0")}
          </span>
          <p>
            {name}
            <br />
            <span>In Bewegung.</span>
          </p>
          <button type="button" onClick={() => setLoaded(true)}>
            Video laden ({video.type === "youtube" ? "YouTube" : "Vimeo"})
          </button>
          <small>
            Beim Laden wird eine Verbindung zu{" "}
            {video.type === "youtube" ? "YouTube" : "Vimeo"} hergestellt.
          </small>
        </div>
      )}
      <a href={video.url} target="_blank" rel="noopener noreferrer">
        Video direkt auf {video.type === "youtube" ? "YouTube" : "Vimeo"}{" "}
        ansehen
      </a>
    </div>
  );
}
