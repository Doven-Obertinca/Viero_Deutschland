"use client";
import { useRef, useState } from "react";
import {
  hexSchema,
  similarColours,
  type TintColour,
} from "@/lib/tinting/model";
import styles from "./tinting.module.css";
export default function ImageColourPicker({
  colours,
  onRequest,
}: {
  colours: TintColour[];
  onRequest: (reference: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [hex, setHex] = useState("#5e7975"),
    [error, setError] = useState(""),
    [loaded, setLoaded] = useState(false),
    [point, setPoint] = useState({ x: 0, y: 0 }),
    [loading, setLoading] = useState(false);
  const extract = (x: number, y: number) => {
    const node = canvas.current;
    if (!node) return;
    const px = Math.max(0, Math.min(node.width - 1, Math.round(x))),
      py = Math.max(0, Math.min(node.height - 1, Math.round(y)));
    const value = node
      .getContext("2d", { willReadFrequently: true })
      ?.getImageData(px, py, 1, 1).data;
    if (value) {
      setHex(
        "#" +
          [...value]
            .slice(0, 3)
            .map((v) => v.toString(16).padStart(2, "0"))
            .join(""),
      );
      setPoint({ x: px, y: py });
    }
  };
  async function upload(file?: File) {
    setError("");
    setLoaded(false);
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError("Bitte JPG, PNG oder WebP bis 10 MB auswählen.");
      return;
    }
    setLoading(true);
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      if (bitmap.width * bitmap.height > 40_000_000) {
        bitmap.close();
        throw Error(
          "Das Bild ist zu groß. Bitte auf höchstens 40 Megapixel verkleinern.",
        );
      }
      const node = canvas.current!;
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      node.width = Math.round(bitmap.width * scale);
      node.height = Math.round(bitmap.height * scale);
      node
        .getContext("2d", { willReadFrequently: true })!
        .drawImage(bitmap, 0, 0, node.width, node.height);
      bitmap.close();
      setLoaded(true);
      extract(node.width / 2, node.height / 2);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Das Bild konnte nicht gelesen werden.",
      );
    } finally {
      setLoading(false);
    }
  }
  const valid = hexSchema.safeParse(hex).success;
  const suggestions = valid ? similarColours(hex, colours) : [];
  const rgb = valid
    ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")
    : "";
  return (
    <div className={styles.matchWorkspace}>
      <div>
        <p className={styles.label}>REFERENZ / DIGITAL</p>
        <h3>Ein Ton. Ein Anfang.</h3>
        <p>
          HEX eingeben oder einen Farbpunkt aus Ihrem Foto wählen. Ihr Bild wird
          ausschließlich auf diesem Gerät verarbeitet.
        </p>
        <label className={styles.field}>
          HEX-Farbreferenz
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            maxLength={7}
            spellCheck={false}
            aria-invalid={!valid}
          />
        </label>
        <p className={styles.small}>
          RGB {rgb || "–"} · Keine physische Tönungsrezeptur.
        </p>
        <label className={styles.upload}>
          Referenzbild auswählen
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <p className={styles.small}>
          JPG, PNG, WebP · bis 10 MB. Bild anklicken oder mit Pfeiltasten einen
          Punkt wählen.
        </p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {loading && <p role="status">Bild wird vorbereitet …</p>}
        <button
          className={styles.primary}
          disabled={!valid}
          onClick={() =>
            onRequest(
              `Digitale HEX-Referenz ${hex.toUpperCase()} (RGB ${rgb}); physische Machbarkeit bitte prüfen.`,
            )
          }
        >
          Diesen Ton anfragen <span aria-hidden="true">＋</span>
        </button>
      </div>
      <div>
        <div
          className={styles.referencePreview}
          style={{ background: valid ? hex : "#d6d5d0" }}
        >
          <span>{valid ? hex.toUpperCase() : "HEX prüfen"}</span>
        </div>
        <canvas
          ref={canvas}
          className={styles.pickerCanvas}
          hidden={!loaded}
          tabIndex={loaded ? 0 : -1}
          role="img"
          aria-label={`Referenzbild mit Farbauswahl bei Position ${point.x}, ${point.y}. Pfeiltasten wählen den nächsten Pixel, Umschalt plus Pfeiltaste zehn Pixel.`}
          onPointerDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            extract(
              ((e.clientX - rect.left) * e.currentTarget.width) / rect.width,
              ((e.clientY - rect.top) * e.currentTarget.height) / rect.height,
            );
          }}
          onKeyDown={(e) => {
            const directions: Record<string, [number, number]> = {
              ArrowLeft: [-1, 0],
              ArrowRight: [1, 0],
              ArrowUp: [0, -1],
              ArrowDown: [0, 1],
            };
            if (directions[e.key]) {
              e.preventDefault();
              const [x, y] = directions[e.key],
                step = e.shiftKey ? 10 : 1;
              extract(point.x + x * step, point.y + y * step);
            }
          }}
        />
        {loaded && (
          <p className={styles.small} role="status">
            Gewählt: {hex.toUpperCase()} · RGB {rgb}
          </p>
        )}
        {!!suggestions.length && (
          <div>
            <p className={styles.label}>VISUELL ÄHNLICHE KATALOGWERTE</p>
            <div className={styles.similar}>
              {suggestions.map((colour) => (
                <button
                  key={colour.id}
                  onClick={() =>
                    onRequest(
                      `${colour.collection} / ${colour.name} – visuelle Ähnlichkeit zu ${hex}; Kompatibilität bitte prüfen.`,
                    )
                  }
                >
                  <span style={{ background: colour.hex }} />
                  {colour.name}
                  <small>{colour.collection}</small>
                </button>
              ))}
            </div>
            <p className={styles.small}>
              Vergleich im OKLab-Farbraum. Ähnlichkeit bestätigt keine
              Tönungskompatibilität.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
