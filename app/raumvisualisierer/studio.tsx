"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/primitives";
import {
  demoMaterials,
  newWall,
  rooms,
  type Material,
  type Project,
} from "@/lib/visualizer/model";
import {
  activeProject,
  rememberProject,
  deleteProject,
  restoreProject,
} from "@/lib/visualizer/storage";
import { Study } from "./study";
import styles from "./experience.module.css";

const Workspace = dynamic(() => import("./workspace"), {
  loading: () => <p role="status">Studio wird geöffnet …</p>,
});

export function Studio({
  catalogRequest,
  preselected,
}: {
  catalogRequest: Promise<Material[] | null>;
  preselected?: string;
}) {
  const [catalog, setCatalog] = useState<Material[] | null>();
  const [project, setProject] = useState<Project>();
  const [revision, setRevision] = useState(0);
  const [saved, setSaved] = useState<Project>();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const uploadPanel = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    let mounted = true;
    const current = activeProject();
    if (current)
      queueMicrotask(() => {
        if (mounted) setProject(current);
      });
    restoreProject()
      .then((value) => {
        if (mounted) setSaved(value);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    catalogRequest.then((value) => {
      if (mounted) setCatalog(value);
    });
    return () => {
      mounted = false;
    };
  }, [catalogRequest]);

  function open(next: Project) {
    setProject(next);
    setRevision((value) => value + 1);
  }

  async function upload(file?: File) {
    if (!file || busy.current) return;
    busy.current = true;
    setError("");
    uploadPanel.current?.scrollIntoView({ block: "center" });
    let preview: string | undefined;
    setStatus("Foto wird geprüft und vorbereitet …");
    try {
      const { normalize, localWallSuggestions } =
        await import("@/lib/visualizer/image");
      const image = await normalize(file);
      preview = URL.createObjectURL(image);
      setPreviewUrl(preview);
      setStatus("Wandvorschlag wird berechnet …");
      const walls = await localWallSuggestions.detect(image).catch(() => []);
      open({
        version: 1,
        image,
        title: "Mein Raumfoto",
        walls: walls.length ? walls : [newWall("01")],
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Das Foto konnte nicht geöffnet werden.",
      );
    } finally {
      if (preview) URL.revokeObjectURL(preview);
      setPreviewUrl(undefined);
      setStatus("");
      busy.current = false;
    }
  }

  const dropPhoto = useEffectEvent((file: File | undefined) => {
    void upload(file);
  });
  useEffect(() => {
    function over(event: DragEvent) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      setDragging(true);
    }
    function leave(event: DragEvent) {
      if (!event.relatedTarget) setDragging(false);
    }
    function drop(event: DragEvent) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      setDragging(false);
      dropPhoto(event.dataTransfer.files[0]);
    }
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, []);

  return (
    <div className={styles.studio}>
      {dragging && (
        <div className={styles.dragSignal} aria-hidden="true">
          Raumfoto hier ablegen
        </div>
      )}
      <section
        className={styles.hero}
        data-fullscreen-hero
        aria-labelledby="studio-title"
      >
        <Image
          src="/brand/spaces/dubai-apartment.webp"
          alt=""
          fill
          sizes="100vw"
          preload
          className={styles.heroImage}
        />
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <i /> VIERO / SPATIAL EXPERIENCE
          </p>
          <h1 id="studio-title">
            RÄUME.
            <br />
            <em>NEU GEDACHT.</em>
          </h1>
          <p className={styles.heroCopy}>
            Erleben Sie, wie außergewöhnliche Oberflächen Räume verändern.
            Entdecken Sie VIERO Materialien direkt in Ihrem Zuhause.
          </p>
          <div className={styles.start}>
            <button
              className={styles.heroAction}
              disabled={!!status}
              onClick={() => input.current?.click()}
            >
              Raumfoto hochladen
            </button>
            <a href="#beispielraeume">Beispielräume entdecken</a>
          </div>
        </div>
        <div className={styles.heroIndex}>
          <a href="#materialstudie">01 / Materialstudie</a>
          <span>FIG. 01 — DUBAI / INTERIOR</span>
        </div>
      </section>
      <Study />
      <section
        id="beispielraeume"
        className={styles.gallery}
        aria-labelledby="examples-title"
      >
        <div className={styles.editorialHead}>
          <p className={styles.eyebrow}>02 / ARCHITEKTURARCHIV</p>
          <h2 id="examples-title">
            Zwei Räume.
            <br />
            Neue Perspektiven.
          </h2>
        </div>
        <div className={styles.roomCards}>
          {rooms.map((room, index) => {
            const [category, name] = room.title.split(" · ");
            return (
              <button
                type="button"
                key={room.title}
                disabled={!!status}
                onClick={() => open(structuredClone(room))}
              >
                <span className={styles.thumbnail}>
                  <Image
                    src={room.image as string}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 90vw, (max-width: 1400px) 58vw, 850px"
                  />
                  <span className={styles.roomOpen}>Raum öffnen</span>
                </span>
                <span className={styles.roomCaption}>
                  <small>
                    0{index + 1} / {category}
                  </small>
                  <strong>{name}</strong>
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section
        ref={uploadPanel}
        className={`${styles.drop} ${dragging ? styles.dragging : ""}`}
        aria-labelledby="upload-title"
      >
        <input
          ref={input}
          hidden
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
          onChange={(event) => {
            void upload(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <div className={styles.uploadCopy}>
          <p className={styles.eyebrow}>03 / IHR EIGENER RAUM</p>
          <h2 id="upload-title">
            Jetzt sind
            <br />
            Sie dran.
          </h2>
          <p>
            JPG, PNG, WebP oder HEIC, falls unterstützt · max. 20 MB.
            <br />
            Ihr Foto bleibt in diesem Browser.
          </p>
          <p role="status">{status}</p>
          {error && <p role="alert">{error}</p>}
          {saved && (
            <div className={styles.saved}>
              <Button onClick={() => open(saved)}>
                Gespeichertes Projekt öffnen
              </Button>
              <button
                onClick={async () => {
                  try {
                    await deleteProject();
                    setSaved(undefined);
                  } catch {
                    setError("Das Projekt konnte nicht gelöscht werden.");
                  }
                }}
              >
                Lokale Kopie löschen
              </button>
            </div>
          )}
        </div>
        <button
          className={styles.uploadTarget}
          disabled={!!status}
          onClick={() => input.current?.click()}
        >
          {previewUrl && <Image src={previewUrl} alt="" fill unoptimized />}
          <strong>
            {dragging ? "Foto jetzt ablegen" : "Foto ablegen oder auswählen"}
          </strong>
        </button>
      </section>
      <div>
        {project && (
          <Workspace
            key={revision}
            focusOnOpen={revision > 0}
            onClose={() => {
              rememberProject(undefined);
              setProject(undefined);
              uploadPanel.current?.scrollIntoView({ block: "center" });
              uploadPanel.current
                ?.querySelector("button")
                ?.focus({ preventScroll: true });
            }}
            initial={project}
            catalog={catalog}
            studies={demoMaterials}
            preselected={preselected}
            onSave={setSaved}
          />
        )}
      </div>
      <div className={styles.discovery}>
        <p className={styles.eyebrow}>04 / VIERO OBERFLÄCHEN</p>
        <a href="/produkte">Materialien entdecken</a>
      </div>
    </div>
  );
}
