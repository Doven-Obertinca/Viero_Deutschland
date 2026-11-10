"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Button, TextLink } from "@/components/ui/primitives";
import { inversePlane } from "@/lib/visualizer/geometry";
import { commit, history, redo, undo } from "@/lib/visualizer/history";
import { canvasBlob, loadImage, maxImageSide } from "@/lib/visualizer/image";
import { createRenderer, wallMask } from "@/lib/visualizer/render";
import { rememberProject, saveProject } from "@/lib/visualizer/storage";
import {
  newWall,
  type Material,
  type Point,
  type Project,
  type Quad,
  type Stroke,
  type Wall,
} from "@/lib/visualizer/model";
import styles from "./studio.module.css";

type Mode = "select" | "outline" | "add" | "erase" | "plane";

export default function Workspace({
  initial,
  catalog,
  studies,
  preselected,
  onSave,
  focusOnOpen,
  onClose,
}: {
  initial: Project;
  catalog: Material[] | null | undefined;
  focusOnOpen: boolean;
  onClose: () => void;
  studies: Material[];
  preselected?: string;
  onSave: (project: Project) => void;
}) {
  const [state, setState] = useState(() => history(initial.walls));
  const walls = state.present;
  const [selection, setSelection] = useState(initial.walls[0]?.id);
  const wall = walls.find((item) => item.id === selection) ?? walls[0];
  const [hover, setHover] = useState<string>();
  const [photo, setPhoto] = useState<HTMLImageElement>();
  const [mode, setMode] = useState<Mode>("select");
  const [vertices, setVertices] = useState<Point[]>([]);
  const [stroke, setStroke] = useState<Stroke>();
  const liveStroke = useRef<Stroke>(undefined);
  const [brush, setBrush] = useState(0.025);
  const [compare, setCompare] = useState(false);
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const drawerTrigger = useRef<HTMLButtonElement>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  const previousFrame = useRef<HTMLCanvasElement>(null);
  const lastWalls = useRef<Wall[]>(undefined);
  const reveal = useRef<Animation>(undefined);
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("image/png");
  const [watermark, setWatermark] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [appliedPreselection, setAppliedPreselection] = useState<string>();
  const section = useRef<HTMLElement>(null);
  const base = useRef<HTMLCanvasElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const materials = useMemo(
    () => [...(catalog ?? []), ...studies],
    [catalog, studies],
  );
  const inquiryParams = new URLSearchParams();
  for (const id of new Set(walls.map((item) => item.material))) {
    if (id && catalog?.some((item) => item.id === id && item.texture)) {
      inquiryParams.append("material", id);
    }
  }
  const inquiryHref = inquiryParams.size
    ? `/kontakt?${inquiryParams}`
    : "/kontakt";
  const material = materials.find((item) => item.id === wall?.material);
  const pending = catalog?.find(
    (item) =>
      item.id === preselected &&
      item.id !== appliedPreselection &&
      item.texture,
  );
  const renderer = useMemo(() => photo && createRenderer(photo, 1080), [photo]);
  const masks = useMemo(
    () =>
      new Map(
        walls.map((item) => [
          item.id,
          wallMask(
            item,
            360,
            Math.max(
              1,
              Math.round(360 * (photo ? photo.height / photo.width : 0.6)),
            ),
          ),
        ]),
      ),
    [walls, photo],
  );

  useEffect(() => {
    if (drawer) drawerClose.current?.focus();
  }, [drawer]);

  function closeDrawer() {
    setDrawer(false);
    drawerTrigger.current?.focus();
  }

  useEffect(() => {
    if (!focusOnOpen) return;
    section.current?.scrollIntoView({ block: "start" });
    section.current?.focus({ preventScroll: true });
  }, [focusOnOpen]);

  useEffect(() => {
    const url =
      typeof initial.image === "string"
        ? initial.image
        : URL.createObjectURL(initial.image);
    let alive = true;
    loadImage(url)
      .then((image) => {
        if (alive) setPhoto(image);
      })
      .catch(() => {
        if (alive) setError("Der Raum konnte nicht geöffnet werden.");
      });
    return () => {
      alive = false;
      if (typeof initial.image !== "string") URL.revokeObjectURL(url);
    };
  }, [initial.image]);

  useEffect(() => {
    rememberProject({ ...initial, walls });
  }, [initial, walls]);

  useEffect(() => {
    if (!renderer || !base.current) return;
    const { original } = renderer;
    base.current.width = original.width;
    base.current.height = original.height;
    base.current.getContext("2d")?.drawImage(original, 0, 0);
  }, [renderer]);

  useEffect(() => {
    if (!renderer || !preview.current) return;
    let current = true;
    const frame = requestAnimationFrame(() => {
      renderer
        .render(walls, materials)
        .then((output) => {
          if (!current || !preview.current) return;
          const layer = preview.current;
          const underlay = previousFrame.current;
          const changed =
            lastWalls.current &&
            walls.find(
              (item) =>
                lastWalls.current?.find((old) => old.id === item.id)
                  ?.material !== item.material && item.material,
            );
          reveal.current?.cancel();
          if (
            underlay &&
            changed &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ) {
            underlay.width = output.width;
            underlay.height = output.height;
            underlay.getContext("2d")?.drawImage(layer, 0, 0);
            const origin = Math.min(
              100,
              Math.max(
                0,
                Math.min(...changed.plane.map((point) => point[0])) * 100,
              ),
            );
            reveal.current = layer.animate(
              [
                { clipPath: `inset(0 ${100 - origin}% 0 0)` },
                { clipPath: "inset(0 0% 0 0)" },
              ],
              { duration: 580, easing: "cubic-bezier(.22,.65,.28,1)" },
            );
            reveal.current.onfinish = () =>
              underlay
                .getContext("2d")
                ?.clearRect(0, 0, underlay.width, underlay.height);
          } else if (underlay) {
            underlay
              .getContext("2d")
              ?.clearRect(0, 0, underlay.width, underlay.height);
          }
          layer.width = output.width;
          layer.height = output.height;
          layer.getContext("2d")?.drawImage(output, 0, 0);
          lastWalls.current = walls;
        })
        .catch(() => {
          if (!current) return;
          preview.current
            ?.getContext("2d")
            ?.clearRect(0, 0, preview.current.width, preview.current.height);
          setError("Eine Oberflächentextur konnte nicht geladen werden.");
        });
    });
    return () => {
      current = false;
      cancelAnimationFrame(frame);
    };
  }, [renderer, walls, materials]);

  useEffect(() => {
    const canvas = overlay.current;
    if (!canvas || !renderer) return;
    canvas.width = renderer.original.width;
    canvas.height = renderer.original.height;
    const context = canvas.getContext("2d")!;
    const target =
      mode === "select" && hover
        ? walls.find((item) => item.id === hover)
        : wall;
    if (target && (!compare || mode !== "select")) {
      const mask = stroke
        ? wallMask(
            { ...target, strokes: [...target.strokes, stroke] },
            canvas.width,
            canvas.height,
          )
        : masks.get(target.id);
      if (mask) {
        context.drawImage(mask.canvas, 0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = "source-in";
        context.fillStyle =
          mode === "select" ? "rgba(220,247,238,.15)" : "rgba(128,224,194,.36)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = "source-over";
      }
      if (mode === "select" && target.strokes.length === 0) {
        context.beginPath();
        target.outline.forEach(([x, y], index) =>
          index === 0
            ? context.moveTo(x * canvas.width, y * canvas.height)
            : context.lineTo(x * canvas.width, y * canvas.height),
        );
        context.closePath();
        context.strokeStyle = "#e0fff4";
        context.lineWidth = 1.5;
        context.stroke();
      }
    }
    if (vertices.length) {
      context.beginPath();
      vertices.forEach(([x, y], index) =>
        index === 0
          ? context.moveTo(x * canvas.width, y * canvas.height)
          : context.lineTo(x * canvas.width, y * canvas.height),
      );
      context.strokeStyle = "#e0fff4";
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = "#e0fff4";
      vertices.forEach(([x, y]) => {
        context.beginPath();
        context.arc(x * canvas.width, y * canvas.height, 4, 0, 2 * Math.PI);
        context.fill();
      });
    }
  }, [renderer, wall, hover, walls, mode, vertices, masks, compare, stroke]);

  function update(patch: Partial<Wall>) {
    if (!wall) return;
    setError("");
    setState((previous) =>
      commit(
        previous,
        previous.present.map((item) =>
          item.id === wall.id ? { ...item, ...patch } : item,
        ),
      ),
    );
  }

  function changeMode(next: Mode) {
    setMode(next);
    setVertices([]);
    if (next !== "select") setCompare(false);
  }

  function finishOutline() {
    if (vertices.length < 3) return;
    const x = vertices.map((point) => point[0]),
      y = vertices.map((point) => point[1]);
    const left = Math.min(...x),
      right = Math.max(...x),
      top = Math.min(...y),
      bottom = Math.max(...y);
    if (right - left < 0.01 || bottom - top < 0.01) {
      setError(
        "Die Fläche ist zu klein. Bitte setzen Sie die Eckpunkte weiter auseinander.",
      );
      return;
    }
    update({
      outline: vertices,
      holes: [],
      strokes: [],
      plane: [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
      ],
    });
    changeMode("select");
  }

  function addWall() {
    const id = String(
      Math.max(0, ...walls.map((item) => Number(item.id))) + 1,
    ).padStart(2, "0");
    setState((previous) =>
      commit(previous, [...previous.present, newWall(id)]),
    );
    setSelection(id);
    changeMode("outline");
  }

  function pointerPoint(event: PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      Math.min(0.99999, Math.max(0, (event.clientX - rect.left) / rect.width)),
      Math.min(0.99999, Math.max(0, (event.clientY - rect.top) / rect.height)),
    ];
  }

  function hit([x, y]: Point) {
    return [...walls].reverse().find((item) => {
      const mask = masks.get(item.id);
      return (
        mask &&
        mask.getImageData(
          Math.floor(x * mask.canvas.width),
          Math.floor(y * mask.canvas.height),
          1,
          1,
        ).data[3] > 128
      );
    })?.id;
  }

  function onDown(event: PointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0) return;
    const point = pointerPoint(event);
    if (mode === "select") {
      // With zoom enabled, native touch scrolling takes precedence over taps.
      if (event.pointerType !== "touch") {
        const id = hit(point);
        if (id) setSelection(id);
      }
    } else if (mode === "outline") {
      setVertices([...vertices, point]);
    } else if (mode === "plane") {
      const next = [...vertices, point];
      if (next.length < 4) setVertices(next);
      else {
        const plane: Quad = [next[0], next[1], next[2], next[3]];
        if (!inversePlane(plane)) {
          setVertices([]);
          setError(
            "Die Eckpunkte bilden keine gültige Fläche. Bitte beginnen Sie erneut oben links.",
          );
          return;
        }
        update({ plane });
        changeMode("select");
      }
    } else {
      event.currentTarget.setPointerCapture(event.pointerId);
      liveStroke.current = {
        size: brush,
        erase: mode === "erase",
        points: [point],
      };
      setStroke(liveStroke.current);
    }
  }

  async function download() {
    if (!photo || exporting) return;
    setExporting(true);
    setError("");
    try {
      const output = await createRenderer(photo, maxImageSide).render(
        walls,
        materials,
        { watermark, markStudies: true },
      );
      const blob = await canvasBlob(output, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `viero-studio.${format === "image/png" ? "png" : "jpg"}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Das Bild konnte nicht exportiert werden.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section
      className={styles.workspace}
      ref={section}
      tabIndex={-1}
      aria-labelledby="workspace-title"
      onKeyDown={(event) => {
        if (event.key === "Escape" && drawer) closeDrawer();
        if (
          !(event.ctrlKey || event.metaKey) ||
          event.key.toLowerCase() !== "z" ||
          /INPUT|TEXTAREA/.test((event.target as HTMLElement).tagName)
        )
          return;
        event.preventDefault();
        setState(event.shiftKey ? redo : undo);
      }}
    >
      <header className={styles.workHeader}>
        <div>
          <p className={styles.eyebrow}>02 / OBERFLÄCHEN GESTALTEN</p>
          <h2 id="workspace-title">{initial.title}</h2>
        </div>
        <div className={styles.tools}>
          <button
            className={styles.mobileMaterials}
            ref={drawerTrigger}
            aria-expanded={drawer}
            aria-controls="studio-materials"
            onClick={() => (drawer ? closeDrawer() : setDrawer(true))}
          >
            Materialien
          </button>
          <button onClick={onClose}>Raum schließen</button>
          <button
            title="Strg oder ⌘ + Z"
            disabled={!state.past.length}
            onClick={() => setState(undo)}
          >
            Rückgängig
          </button>
          <button
            title="Strg oder ⌘ + Umschalt + Z"
            disabled={!state.future.length}
            onClick={() => setState(redo)}
          >
            Wiederholen
          </button>
          <button
            aria-pressed={compare}
            onClick={() => {
              changeMode("select");
              setCompare(!compare);
            }}
          >
            Vorher / Nachher
          </button>
        </div>
      </header>
      <div className={styles.grid}>
        <aside
          id="studio-materials"
          className={styles.explorer}
          data-open={drawer}
          aria-labelledby="materials-title"
        >
          <button
            ref={drawerClose}
            className={styles.drawerClose}
            onClick={closeDrawer}
          >
            Materialien schließen
          </button>
          <h3 id="materials-title">Materialbibliothek</h3>
          <h3>Strukturstudien</h3>
          <p>
            Neutrale Beispieltexturen zum Ausprobieren des Studios. Keine VIERO
            Produktmuster.
          </p>
          <div className={styles.studies}>
            {studies.map((item) => (
              <button
                key={item.id}
                aria-pressed={material?.id === item.id}
                onClick={() => {
                  update({ material: item.id });
                  if (drawer) closeDrawer();
                }}
              >
                <span style={{ backgroundColor: item.pigment }} />
                {item.name}
              </button>
            ))}
          </div>
          <p className={styles.catalogLabel}>VIERO / PRODUKTKATALOG</p>
          <label className={styles.field}>
            Produkt suchen
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
            />
          </label>
          {pending && (
            <Button
              onClick={() => {
                update({ material: pending.id });
                setAppliedPreselection(pending.id);
              }}
            >
              {pending.name} auf Wand {wall?.id} anwenden
            </Button>
          )}
          {catalog === undefined && (
            <p role="status">Produktkatalog wird geladen …</p>
          )}
          {catalog === null && (
            <p>Der VIERO Produktkatalog ist derzeit nicht erreichbar.</p>
          )}
          {catalog?.length === 0 && (
            <p>Keine Produkte aus der Wanddekoration verfügbar.</p>
          )}
          {catalog &&
            catalog.length > 0 &&
            !catalog.some((item) =>
              item.name
                .toLocaleLowerCase("de")
                .includes(query.trim().toLocaleLowerCase("de")),
            ) && <p>Keine passenden Produkte.</p>}
          <div className={styles.products}>
            {catalog
              ?.filter((item) =>
                item.name
                  .toLocaleLowerCase("de")
                  .includes(query.trim().toLocaleLowerCase("de")),
              )
              .map((item) => (
                <article key={item.id} className={styles.product}>
                  <div>
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        width={280}
                        height={180}
                        unoptimized
                      />
                    )}
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.color || item.family}</small>
                    </div>
                  </div>
                  {item.texture || item.photoSample ? (
                    <button
                      aria-pressed={material?.id === item.id}
                      onClick={() => {
                        update({ material: item.id });
                        if (drawer) closeDrawer();
                      }}
                    >
                      {item.texture ? "Anwenden" : "Fotovorschau anwenden"}
                    </button>
                  ) : (
                    <small>Vorschau fehlt</small>
                  )}
                  {item.photoSample && !item.texture && (
                    <small>{item.photoSample.name} · Beispieloberfläche</small>
                  )}
                  {item.href && (
                    <TextLink href={item.href}>Produkt entdecken</TextLink>
                  )}
                </article>
              ))}
          </div>
        </aside>
        <div className={styles.stage}>
          <div ref={viewport} className={styles.viewport}>
            {renderer ? (
              <div
                className={styles.scene}
                style={{
                  width: `${zoom * 100}%`,
                  aspectRatio:
                    renderer.original.width / renderer.original.height,
                }}
              >
                <canvas
                  ref={base}
                  role="img"
                  aria-label={`Originalfoto: ${initial.title}`}
                />
                <div
                  className={styles.renderLayers}
                  style={{
                    clipPath: compare ? `inset(0 0 0 ${split}%)` : undefined,
                  }}
                >
                  <canvas ref={previousFrame} aria-hidden="true" />
                  <canvas ref={preview} aria-hidden="true" />
                </div>
                {compare && (
                  <div
                    className={styles.divider}
                    style={{ left: `${split}%` }}
                    onPointerDown={(event) =>
                      event.currentTarget.setPointerCapture(event.pointerId)
                    }
                    onPointerMove={(event) => {
                      if (
                        !event.currentTarget.hasPointerCapture(event.pointerId)
                      )
                        return;
                      const scene =
                        event.currentTarget.parentElement!.getBoundingClientRect();
                      setSplit(
                        Math.max(
                          0,
                          Math.min(
                            100,
                            ((event.clientX - scene.left) / scene.width) * 100,
                          ),
                        ),
                      );
                    }}
                  />
                )}
                <canvas
                  ref={overlay}
                  aria-hidden="true"
                  style={{
                    touchAction: mode === "select" ? "auto" : "none",
                    cursor:
                      mode !== "select"
                        ? "crosshair"
                        : hover
                          ? "pointer"
                          : undefined,
                  }}
                  onPointerDown={onDown}
                  onPointerMove={(event) => {
                    const point = pointerPoint(event);
                    if (mode === "select" && event.pointerType === "mouse")
                      setHover(hit(point));
                    if (liveStroke.current) {
                      liveStroke.current = {
                        ...liveStroke.current,
                        points: [...liveStroke.current.points, point],
                      };
                      setStroke(liveStroke.current);
                    }
                  }}
                  onPointerLeave={() => setHover(undefined)}
                  onPointerCancel={() => {
                    liveStroke.current = undefined;
                    setStroke(undefined);
                  }}
                  onPointerUp={(event) => {
                    if (mode === "select" && event.pointerType === "touch") {
                      const id = hit(pointerPoint(event));
                      if (id) setSelection(id);
                    }
                    if (liveStroke.current && wall)
                      update({
                        strokes: [...wall.strokes, liveStroke.current],
                      });
                    liveStroke.current = undefined;
                    setStroke(undefined);
                  }}
                />
                {compare && (
                  <>
                    <span className={styles.before}>Vorher</span>
                    <span className={styles.after}>Nachher</span>
                  </>
                )}
              </div>
            ) : (
              <p role="status">{error || "Raum wird geladen …"}</p>
            )}
          </div>
          {compare && (
            <label className={styles.field}>
              Vorher / Nachher{" "}
              <input
                type="range"
                min="0"
                max="100"
                value={split}
                onChange={(event) => setSplit(event.target.valueAsNumber)}
              />
            </label>
          )}
          <div className={styles.tools}>
            <label>
              Zoom{" "}
              <input
                type="range"
                min="1"
                max="3"
                step=".1"
                value={zoom}
                onChange={(event) => setZoom(event.target.valueAsNumber)}
              />
            </label>
            <button onClick={() => setZoom(1)}>Einpassen</button>
            {renderer && (
              <button
                onClick={async () => {
                  try {
                    if (document.fullscreenElement)
                      await document.exitFullscreen();
                    else await viewport.current?.requestFullscreen();
                  } catch {
                    setError("Vollbild ist in diesem Browser nicht verfügbar.");
                  }
                }}
              >
                Vollbild
              </button>
            )}
          </div>
          {typeof initial.image !== "string" && (
            <p className={styles.note}>
              Prüfen Sie den Wandvorschlag. Zeichnen Sie fehlende Flächen ein
              und sparen Sie Fenster, Möbel und andere Objekte mit dem Radierer
              aus.
            </p>
          )}
          {mode === "outline" && (
            <p role="status">
              Setzen Sie mindestens drei Punkte entlang der Wandkante.
            </p>
          )}
          {mode === "plane" && (
            <p role="status">
              Setzen Sie vier Eckpunkte: oben links, oben rechts, unten rechts,
              unten links.
            </p>
          )}
          {error && <p role="alert">{error}</p>}
        </div>
        <aside className={styles.inspector} aria-labelledby="surfaces-title">
          <h3 id="surfaces-title">Oberflächen im Raum</h3>
          <div className={styles.wallList}>
            {walls.map((item) => (
              <button
                key={item.id}
                aria-pressed={item.id === wall?.id}
                onClick={() => {
                  setSelection(item.id);
                  changeMode("select");
                }}
              >
                <strong>Wand {item.id}</strong>
                <small>
                  {materials.find((option) => option.id === item.material)
                    ?.name ?? "Original"}
                </small>
              </button>
            ))}
          </div>
          <div className={styles.tools}>
            <button onClick={addWall}>Wand hinzufügen</button>
            <button
              aria-pressed={mode === "outline"}
              onClick={() => changeMode("outline")}
            >
              Umriss zeichnen
            </button>
            <button
              aria-pressed={mode === "plane"}
              onClick={() => changeMode("plane")}
            >
              Perspektive setzen
            </button>
            <button
              aria-pressed={mode === "add"}
              onClick={() => changeMode("add")}
            >
              Pinsel
            </button>
            <button
              aria-pressed={mode === "erase"}
              onClick={() => changeMode("erase")}
            >
              Radierer
            </button>
            {mode !== "select" && (
              <button onClick={() => changeMode("select")}>
                Fertig / Abbrechen
              </button>
            )}
            {mode === "outline" && (
              <button disabled={vertices.length < 3} onClick={finishOutline}>
                Umriss übernehmen
              </button>
            )}
          </div>
          {(mode === "add" || mode === "erase") && (
            <label className={styles.field}>
              Pinselgröße
              <input
                type="range"
                min=".004"
                max=".12"
                step=".002"
                value={brush}
                onChange={(event) => setBrush(event.target.valueAsNumber)}
              />
            </label>
          )}
          {wall &&
            walls.some((item) => item.id !== wall.id && item.material) && (
              <label className={styles.field}>
                Materialeinstellungen übernehmen
                <select
                  value=""
                  onChange={(event) => {
                    const source = walls.find(
                      (item) => item.id === event.target.value,
                    );
                    if (!source) return;
                    const { material, scale, rotation, intensity } = source;
                    update({ material, scale, rotation, intensity });
                  }}
                >
                  <option value="">Wand auswählen</option>
                  {walls
                    .filter((item) => item.id !== wall.id && item.material)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        Wand {item.id}
                      </option>
                    ))}
                </select>
              </label>
            )}
          {wall && material && (
            <div className={styles.settings}>
              <p className={styles.eyebrow}>
                WAND {wall.id} / {material.name}
              </p>
              <label className={styles.field}>
                Strukturgröße
                <input
                  type="range"
                  min=".2"
                  max="4"
                  step=".1"
                  value={wall.scale}
                  onChange={(event) =>
                    update({ scale: event.target.valueAsNumber })
                  }
                />
              </label>
              <label className={styles.field}>
                Ausrichtung
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={wall.rotation}
                  onChange={(event) =>
                    update({ rotation: event.target.valueAsNumber })
                  }
                />
              </label>
              <label className={styles.field}>
                Deckkraft
                <input
                  type="range"
                  min=".1"
                  max="1"
                  step=".05"
                  value={wall.intensity}
                  onChange={(event) =>
                    update({ intensity: event.target.valueAsNumber })
                  }
                />
              </label>
              <button
                onClick={() =>
                  update({
                    material: undefined,
                    scale: 1,
                    rotation: 0,
                    intensity: 1,
                  })
                }
              >
                Original wiederherstellen
              </button>
              {material.photoSample && !material.texture && (
                <p>
                  Fotovorschau aus einer Beispieloberfläche. Farbe und Glanz
                  können vom gewählten Produktfarbton abweichen.
                </p>
              )}
              {material.description && <p>{material.description}</p>}
              {material.href && (
                <TextLink href={material.href}>Produkt entdecken</TextLink>
              )}
            </div>
          )}
          <TextLink href={inquiryHref}>Beratung anfragen</TextLink>
        </aside>
      </div>
      <footer className={styles.workFooter}>
        <div className={styles.tools}>
          <button
            onClick={() => {
              changeMode("select");
              setState((previous) =>
                commit(
                  previous,
                  walls.map((item) => ({
                    ...item,
                    material: undefined,
                    scale: 1,
                    rotation: 0,
                    intensity: 1,
                  })),
                ),
              );
            }}
          >
            Alle Materialien zurücksetzen
          </button>
          <button
            onClick={async () => {
              const project = { ...initial, walls };
              try {
                await saveProject(project);
                onSave(project);
                setStatus("Projekt in diesem Browser gespeichert.");
              } catch {
                setStatus(
                  "Das Projekt konnte in diesem Browser nicht gespeichert werden.",
                );
              }
            }}
          >
            Lokal speichern
          </button>
        </div>
        <div className={styles.tools}>
          <label>
            Format{" "}
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={watermark}
              onChange={(event) => setWatermark(event.target.checked)}
            />{" "}
            VIERO Wasserzeichen
          </label>
          <Button
            disabled={!photo || exporting}
            onClick={() => void download()}
          >
            {exporting ? "Export läuft …" : "Bild exportieren"}
          </Button>
        </div>
        <p role="status">{status}</p>
      </footer>
    </section>
  );
}
