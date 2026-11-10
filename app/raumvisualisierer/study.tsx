"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { demoMaterials, rooms } from "@/lib/visualizer/model";
import styles from "./experience.module.css";

export function Study() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const busy = useRef(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [split, setSplit] = useState(48);
  const room = rooms[1];

  async function start() {
    if (busy.current) return;
    busy.current = true;
    setStatus("Strukturstudie wird berechnet …");
    try {
      const [{ loadImage }, { createRenderer }] = await Promise.all([
        import("@/lib/visualizer/image"),
        import("@/lib/visualizer/render"),
      ]);
      const photo = await loadImage(room.image as string);
      const output = await createRenderer(photo, 1080).render(
        room.walls.map((wall) => ({ ...wall, material: demoMaterials[1].id })),
        demoMaterials,
      );
      const layer = canvas.current;
      if (!layer) return;
      layer.width = output.width;
      layer.height = output.height;
      layer.getContext("2d")?.drawImage(output, 0, 0);
      setReady(true);
      setStatus("");
    } catch {
      setStatus("Die Strukturstudie konnte nicht geladen werden.");
    } finally {
      busy.current = false;
    }
  }

  return (
    <section
      id="materialstudie"
      className={styles.study}
      aria-labelledby="study-title"
    >
      <div className={styles.studyCopy}>
        <p className={styles.eyebrow}>01 / WIRKUNG DER OBERFLÄCHE</p>
        <h2 id="study-title">
          Ein Raum.
          <br />
          Zwei Wirkungen.
        </h2>
        <p>
          Sehen Sie, wie Struktur und Farbton die Stimmung eines Raumes
          verändern.
        </p>
        <small>Interaktive Strukturstudie · Kein VIERO Produktmuster</small>
      </div>
      <div>
        <div className={styles.studyImage}>
          <Image
            src={room.image as string}
            alt="Travertinküche mit drei schwarzen Wandleuchten"
            fill
            sizes="(max-width: 760px) 90vw, 65vw"
            loading="eager"
            fetchPriority="low"
          />
          <canvas
            ref={canvas}
            aria-hidden="true"
            hidden={!ready}
            style={{ clipPath: `inset(0 0 0 ${split}%)` }}
          />
          {ready ? (
            <>
              <i className={styles.studyLine} style={{ left: `${split}%` }} />
              <span>Original</span>
              <span>Strukturstudie</span>
            </>
          ) : (
            <button onClick={() => void start()}>Vergleich öffnen</button>
          )}
        </div>
        {ready && (
          <label className={styles.studyRange}>
            Original / Strukturstudie{" "}
            <input
              type="range"
              min="0"
              max="100"
              value={split}
              onChange={(event) => setSplit(event.target.valueAsNumber)}
            />
          </label>
        )}
        <p className={styles.studyStatus} role="status">
          {status}
        </p>
      </div>
    </section>
  );
}
