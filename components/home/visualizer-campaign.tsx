"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  demoMaterials,
  rooms,
  visualizerPath,
  type Material,
} from "@/lib/visualizer/model";
import styles from "./visualizer-campaign.module.css";

const room = rooms[0];
const photo = room.image as string;
const study = demoMaterials[1];

export function VisualizerCampaign({
  materials,
}: {
  materials: Promise<Material[]>;
}) {
  const [finishes, setFinishes] = useState<Material[]>([]);
  const [selected, setSelected] = useState<Material>();
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState<Material>();
  const [split, setSplit] = useState(50);
  const [error, setError] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const touched = useRef(false);
  const frames = useRef(new Map<string, HTMLCanvasElement>());
  const material = selected ?? finishes[0] ?? study;

  useEffect(() => {
    let active = true;
    materials.then((items) => {
      if (active) setFinishes(items);
    });
    return () => {
      active = false;
    };
  }, [materials]);

  useEffect(() => {
    const target = scene.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.12) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    async function render() {
      try {
        let frame = frames.current.get(material.id);
        if (!frame) {
          const [{ loadImage }, { createRenderer }] = await Promise.all([
            import("@/lib/visualizer/image"),
            import("@/lib/visualizer/render"),
          ]);
          if (!active) return;
          const image = await loadImage(photo);
          if (!active) return;
          frame = await createRenderer(image, 1080).render(
            room.walls.map((wall, index) =>
              index === 0 ? { ...wall, material: material.id } : wall,
            ),
            [material],
          );
          if (!active) return;
          frames.current.set(material.id, frame);
        }
        const layer = canvas.current;
        if (!layer) return;
        layer.width = frame.width;
        layer.height = frame.height;
        layer.getContext("2d")?.drawImage(frame, 0, 0);
        layer.animate([{ opacity: 0.65 }, { opacity: 1 }], {
          duration: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 0
            : 280,
        });
        setShown(material);
        setError(false);
        if (!touched.current) {
          touched.current = true;
          setSplit(44);
        }
      } catch {
        if (active) setError(true);
      }
    }
    void render();
    return () => {
      active = false;
    };
  }, [material, visible]);

  return (
    <section
      id="raumkampagne"
      className={styles.campaign}
      data-entered={visible || undefined}
      aria-labelledby="room-campaign-title"
    >
      <div
        ref={scene}
        className={styles.scene}
        style={{ "--split": `${split}%` } as CSSProperties}
      >
        <Image
          src={photo}
          alt="Wohnraum in Dubai mit mineralischer Wand, Esstisch und Kronleuchter"
          fill
          sizes="100vw"
        />
        <canvas
          ref={canvas}
          className={styles.finish}
          hidden={!shown}
          aria-hidden="true"
        />
        <div className={styles.guide} hidden={!shown} aria-hidden="true">
          <span>‹ ›</span>
        </div>
        <input
          className={styles.range}
          type="range"
          min="0"
          max="100"
          value={split}
          disabled={!shown}
          aria-label="Original und Oberflächenvorschau vergleichen"
          aria-valuetext={`${split} Prozent Original`}
          onChange={(event) => {
            touched.current = true;
            setSplit(event.target.valueAsNumber);
          }}
        />
        <div className={styles.labels} aria-hidden="true">
          <span>Original</span>
          {shown && (
            <span>{shown.texture ? "Mit VIERO" : "Strukturstudie"}</span>
          )}
        </div>
        <span className={styles.hint} aria-hidden="true" hidden={!shown}>
          Ziehen, um zu vergleichen
        </span>
      </div>
      <div className={styles.editorial}>
        <p className={styles.kicker}>
          VIERO STUDIO / INTERAKTIVE RAUMGESTALTUNG
        </p>
        <h2 id="room-campaign-title">
          Dein Raum.
          <br />
          Neu gedacht.
        </h2>
        <p>
          Eigenes Foto hochladen, eine Oberfläche wählen und direkt an der Wand
          ausprobieren.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={visualizerPath}>
            Jetzt eigenen Raum gestalten
          </Link>
          <Link
            className={styles.secondary}
            href={`${visualizerPath}#materialstudie`}
          >
            So funktioniert’s
          </Link>
        </div>
      </div>
      <div className={styles.caption}>
        <span>FIG. 01 / WOHNRAUM DUBAI</span>
        {finishes.length > 0 && (
          <div
            className={styles.switcher}
            role="group"
            aria-label="Oberfläche entdecken"
          >
            {finishes.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={item.id === material.id}
                onClick={() => {
                  setError(false);
                  setSelected(item);
                }}
              >
                {item.texture && (
                  <Image src={item.texture} alt="" width={24} height={24} />
                )}
                {item.name}
                {item.color && ` · ${item.color}`}
              </button>
            ))}
          </div>
        )}
        <span role="status">
          {error
            ? "Vorschau vorübergehend nicht verfügbar"
            : shown?.texture
              ? shown.name
              : shown
                ? "Strukturstudie · Kein VIERO Produktmuster"
                : ""}
        </span>
      </div>
    </section>
  );
}
