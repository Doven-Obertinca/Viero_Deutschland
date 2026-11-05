"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  accuracyLabel,
  emptySaved,
  readSaved,
  sharedSelection,
  type SavedColours,
  type TintCatalog,
  type TintColour,
} from "@/lib/tinting/model";
import { panelInk } from "@/lib/content/product-colours";
import { TintEnquiry } from "./tint-enquiry";
import styles from "./tinting.module.css";
const ImageColourPicker = dynamic(() => import("./image-colour-picker"), {
  loading: () => <p role="status">Farbwerkzeug wird geladen …</p>,
});
const storageKey = "viero.tinting.v1";
export function TintingExperience({ catalog }: { catalog: TintCatalog }) {
  const [saved, setSaved] = useState<SavedColours>(emptySaved),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState("");
  const [query, setQuery] = useState(""),
    [family, setFamily] = useState("Alle"),
    [collection, setCollection] = useState(""),
    [filterMaterial, setFilterMaterial] = useState(""),
    [onlyFavourites, setOnlyFavourites] = useState(false),
    [descending, setDescending] = useState(false),
    [limit, setLimit] = useState(16);
  const [selectedId, setSelectedId] = useState(catalog.colours[0]?.id || ""),
    [materialId, setMaterialId] = useState(catalog.materials[0]?.id || ""),
    [secondMaterial, setSecondMaterial] = useState(""),
    [compareIds, setCompareIds] = useState<string[]>([]),
    [projectId, setProjectId] = useState(""),
    [reference, setReference] = useState(""),
    [notice, setNotice] = useState("");
  const [zoomedId, setZoomedId] = useState("");
  const zoomedMaterial = catalog.materials.find((m) => m.id === zoomedId);
  const detail = useRef<HTMLDialogElement>(null),
    zoom = useRef<HTMLDialogElement>(null);
  const detailTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    let active = true;
    // Hydrate browser-only state after the server render without persisting
    // the empty server snapshot over an existing selection.
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const restored = readSaved(localStorage.getItem(storageKey));
        setSaved(restored);
        if (catalog.colours.some((c) => c.id === restored.selection?.colourId))
          setSelectedId(restored.selection!.colourId);
        if (
          catalog.materials.some((m) => m.id === restored.selection?.materialId)
        )
          setMaterialId(restored.selection!.materialId);
      } catch {
        setStorageError(
          "Speichern ist in diesem Browser nicht verfügbar. Die Auswahl bleibt für diesen Besuch erhalten.",
        );
      }
      const shared = sharedSelection(
        new URLSearchParams(location.search),
        catalog,
      );
      if (shared.colourIds.length) {
        setCompareIds(shared.colourIds.slice(0, 4));
        setSelectedId(shared.colourIds[0]);
      }
      if (shared.materialIds.length) setMaterialId(shared.materialIds[0]);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [catalog]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...saved,
          selection: { colourId: selectedId, materialId },
        }),
      );
    } catch {
      queueMicrotask(() =>
        setStorageError(
          "Ihre Auswahl konnte nicht dauerhaft gespeichert werden. Bitte die Zusammenfassung exportieren.",
        ),
      );
    }
  }, [saved, ready, selectedId, materialId]);
  const selected = catalog.colours.find((c) => c.id === selectedId),
    material = catalog.materials.find((m) => m.id === materialId),
    other = catalog.materials.find((m) => m.id === secondMaterial),
    project = saved.projects.find((p) => p.id === projectId);
  const families = ["Alle", ...new Set(catalog.colours.map((c) => c.family))];
  const filtered = useMemo(
    () =>
      catalog.colours
        .filter(
          (c) =>
            (family === "Alle" || c.family === family) &&
            (!collection || c.collection === collection) &&
            (!filterMaterial || c.materialIds.includes(filterMaterial)) &&
            (!onlyFavourites || saved.favourites.includes(c.id)) &&
            `${c.name} ${c.code || ""} ${c.collection}`
              .toLocaleLowerCase("de")
              .includes(query.trim().toLocaleLowerCase("de")),
        )
        .sort(
          (a, b) =>
            (descending ? -1 : 1) *
            a.name.localeCompare(b.name, "de", { numeric: true }),
        ),
    [
      catalog,
      family,
      collection,
      filterMaterial,
      onlyFavourites,
      saved.favourites,
      query,
      descending,
    ],
  );
  const compatible = !!selected?.materialIds.includes(materialId);
  function favourite(id: string) {
    setSaved((current) => ({
      ...current,
      favourites: current.favourites.includes(id)
        ? current.favourites.filter((x) => x !== id)
        : [...current.favourites, id],
    }));
  }
  function request(text: string) {
    setReference(text);
    document.getElementById("anfrage")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    setNotice("Farbreferenz zur Anfrage hinzugefügt.");
  }
  function select(colour: TintColour) {
    setSelectedId(colour.id);
    if (!colour.materialIds.includes(materialId))
      setMaterialId(colour.materialIds[0]);
  }
  function openDetail(colour: TintColour, trigger: HTMLElement) {
    select(colour);
    detailTrigger.current = trigger;
    detail.current?.showModal();
  }
  function updateProject(patch: Partial<SavedColours["projects"][number]>) {
    setSaved((current) => ({
      ...current,
      projects: current.projects.map((p) =>
        p.id === projectId
          ? { ...p, ...patch, updated: new Date().toISOString() }
          : p,
      ),
    }));
  }
  function addToProject() {
    if (!selected) return;
    let id = projectId;
    if (!project) {
      if (saved.projects.length >= 30) {
        setNotice(
          "Bitte zuerst ein vorhandenes Projekt auswählen oder löschen (maximal 30 Projekte).",
        );
        return;
      }
      id = crypto.randomUUID();
      setProjectId(id);
      setSaved((current) => ({
        ...current,
        projects: [
          ...current.projects,
          {
            id,
            name: "Mein Farbprojekt",
            colourIds: [selected.id],
            materialIds: materialId ? [materialId] : [],
            notes: "",
            updated: new Date().toISOString(),
          },
        ],
      }));
    } else
      updateProject({
        colourIds: [...new Set([...project.colourIds, selected.id])].slice(
          0,
          100,
        ),
        materialIds: [
          ...new Set([...project.materialIds, materialId].filter(Boolean)),
        ],
      });
    setNotice("Auswahl im Projekt gespeichert.");
  }
  async function share() {
    const params = new URLSearchParams();
    const ids = project?.colourIds ||
      (compareIds.length && compareIds) || [selectedId];
    params.set("farben", ids.filter(Boolean).slice(0, 12).join(","));
    params.set(
      "materialien",
      (project?.materialIds || [materialId])
        .filter(Boolean)
        .slice(0, 6)
        .join(","),
    );
    const url = `${location.origin}/toenung?${params}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice(
        "Auswahllink kopiert. Projektnamen, Notizen und Kontaktdaten sind nicht enthalten.",
      );
    } catch {
      setNotice(`Auswahllink: ${url}`);
    }
  }
  function download() {
    const payload = {
      brand: "Viero Deutschland",
      date: new Date().toISOString(),
      project: project?.name || "Farbauswahl",
      notes: project?.notes || "",
      colours: (
        project?.colourIds ||
        (compareIds.length && compareIds) || [selectedId]
      )
        .map((id) => catalog.colours.find((c) => c.id === id))
        .filter(Boolean),
      materials: (project?.materialIds || [materialId])
        .map((id) => catalog.materials.find((m) => m.id === id))
        .filter(Boolean),
      notice:
        "Digitale Vorschau ist keine Freigabe einer physischen Tönungsrezeptur.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "viero-farbprojekt.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const referenceFor = (colour: TintColour) =>
    `${colour.collection} / ${colour.code || colour.name}${colour.hex ? ` / ${colour.hex}` : ""} – ${accuracyLabel(colour)}. Material: ${catalog.materials
      .filter((m) => colour.materialIds.includes(m.id))
      .map((m) => m.name)
      .join(", ")}. Machbarkeit bitte prüfen.`;
  return (
    <>
      <div className={styles.liveNotice} role="status" aria-live="polite">
        {notice}
        {notice && (
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Hinweis schließen"
          >
            ×
          </button>
        )}
      </div>
      <section
        className={styles.section}
        id="farben"
        aria-labelledby="colours-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.label}>01 / EXPLORER</p>
          <h2 id="colours-title">
            Die Welt
            <br />
            <span>der Nuancen.</span>
          </h2>
          <p>
            Entdecken Sie Farben, die Räume prägen und Oberflächen Charakter
            verleihen. Ihre Auswahl beginnt hier.
          </p>
        </div>
        {!catalog.available && (
          <p className={styles.error} role="status">
            Der Farbkatalog ist vorübergehend nicht erreichbar. Sie können
            weiterhin eine eigene Referenz auswählen und eine Tönung anfragen.
          </p>
        )}
        <div className={styles.explorerBar}>
          <label className={styles.field}>
            Farbname oder Code
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(16);
              }}
              placeholder="Zum Beispiel MAR01 oder Gold"
            />
          </label>
          <label className={styles.field}>
            Kollektion
            <select
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value);
                setLimit(16);
              }}
            >
              <option value="">Alle Kollektionen</option>
              {[...new Set(catalog.colours.map((c) => c.collection))].map(
                (c) => (
                  <option key={c}>{c}</option>
                ),
              )}
            </select>
          </label>
          <label className={styles.field}>
            Material
            <select
              value={filterMaterial}
              onChange={(e) => {
                setFilterMaterial(e.target.value);
                setLimit(16);
              }}
            >
              <option value="">Alle Materialien</option>
              {catalog.materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Sortierung
            <select
              value={descending ? "desc" : "asc"}
              onChange={(e) => setDescending(e.target.value === "desc")}
            >
              <option value="asc">Name A–Z</option>
              <option value="desc">Name Z–A</option>
            </select>
          </label>
        </div>
        <div
          className={styles.familyTabs}
          role="group"
          aria-label="Farbfamilien"
        >
          {families.map((name) => (
            <button
              key={name}
              aria-pressed={family === name}
              onClick={() => {
                setFamily(name);
                setLimit(16);
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <div className={styles.explorerMeta}>
          <p role="status">{filtered.length} Katalogfarben</p>
          <label>
            <input
              type="checkbox"
              checked={onlyFavourites}
              onChange={(e) => setOnlyFavourites(e.target.checked)}
            />{" "}
            Nur Merkliste ({saved.favourites.length})
          </label>
          <button
            onClick={() => {
              setQuery("");
              setFamily("Alle");
              setCollection("");
              setFilterMaterial("");
              setOnlyFavourites(false);
              setLimit(16);
            }}
          >
            Filter zurücksetzen
          </button>
        </div>
        <p className={styles.small}>
          Katalogreferenzen stammen aus den Produktvarianten. Nicht hinterlegte
          Digitalwerte werden nicht erfunden. Bildschirmfarben und
          Farbnäherungen ersetzen kein Originalmuster.
        </p>
        <div className={styles.colourGrid}>
          {filtered.slice(0, limit).map((colour) => (
            <article className={styles.colourCard} key={colour.id}>
              <button
                className={`${styles.colourFace} ${!colour.hex ? styles.noDigital : ""}`}
                style={{
                  backgroundColor: colour.hex || "#deddd6",
                  color: colour.hex ? panelInk(colour.hex) : "#474b43",
                }}
                onClick={(e) => openDetail(colour, e.currentTarget)}
                aria-label={`${colour.collection}, ${colour.name}: Details öffnen`}
              >
                <span>{colour.code || colour.name}</span>
                <small>
                  {colour.hex
                    ? accuracyLabel(colour)
                    : "Originalmuster anfragen"}
                </small>
                <span className={styles.facePlus} aria-hidden="true">
                  ＋
                </span>
              </button>
              <div className={styles.colourCaption}>
                <div>
                  <h3>{colour.name}</h3>
                  <p>{colour.collection}</p>
                </div>
                <button
                  onClick={() => favourite(colour.id)}
                  aria-pressed={saved.favourites.includes(colour.id)}
                  aria-label={`${colour.name} ${saved.favourites.includes(colour.id) ? "aus Merkliste entfernen" : "merken"}`}
                >
                  {saved.favourites.includes(colour.id) ? "♥" : "♡"}
                </button>
              </div>
              <label className={styles.compareToggle}>
                <input
                  type="checkbox"
                  checked={compareIds.includes(colour.id)}
                  disabled={
                    compareIds.length >= 4 && !compareIds.includes(colour.id)
                  }
                  onChange={() =>
                    setCompareIds((current) =>
                      current.includes(colour.id)
                        ? current.filter((id) => id !== colour.id)
                        : [...current, colour.id],
                    )
                  }
                />{" "}
                Vergleichen
              </label>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <div className={styles.empty}>
            <h3>Raum für eine neue Suche.</h3>
            <p>
              Ändern Sie die Filter oder fragen Sie Ihren individuellen
              Wunschfarbton an.
            </p>
            <a href="#anfrage" className={styles.textLink}>
              Individuellen Farbton anfragen
            </a>
          </div>
        )}
        {filtered.length > limit && (
          <button
            className={styles.secondary}
            onClick={() => setLimit((v) => v + 16)}
          >
            Weitere Nuancen anzeigen ({Math.min(limit, filtered.length)} /{" "}
            {filtered.length})
          </button>
        )}
        {!!compareIds.length && (
          <div className={styles.colourCompare}>
            <div className={styles.inlineHeading}>
              <h3>Nuancen im Dialog.</h3>
              <button
                className={styles.textButton}
                onClick={() => setCompareIds([])}
              >
                Vergleich leeren
              </button>
            </div>
            <div className={styles.compareStrip}>
              {compareIds
                .map((id) => catalog.colours.find((c) => c.id === id))
                .filter((c): c is TintColour => !!c)
                .map((c) => (
                  <div key={c.id}>
                    <div style={{ background: c.hex || "#deddd6" }} />
                    <h4>{c.name}</h4>
                    <p>{c.collection}</p>
                    <small>{accuracyLabel(c)}</small>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>
      <section
        className={`${styles.section} ${styles.studioSection}`}
        id="studio"
        aria-labelledby="studio-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.label}>02 / MATERIAL × FARBE</p>
          <h2 id="studio-title">
            Farbe trifft
            <br />
            <span>Struktur.</span>
          </h2>
          <p>
            Ein Material. Viele Ausdrucksmöglichkeiten. Erkunden Sie echte
            Produktabbildungen und die dazu geführten Katalogfarben.
          </p>
        </div>
        <div className={styles.studio}>
          <div className={styles.studioControls}>
            <label className={styles.field}>
              01 — Material
              <select
                value={materialId}
                onChange={(e) => {
                  setMaterialId(e.target.value);
                  const next = catalog.colours.find((c) =>
                    c.materialIds.includes(e.target.value),
                  );
                  if (next) setSelectedId(next.id);
                }}
              >
                <option value="" disabled>
                  Material wählen
                </option>
                {catalog.materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              02 — Katalogfarbe
              <select
                value={compatible ? selectedId : ""}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="" disabled>
                  Farbe wählen
                </option>
                {catalog.colours
                  .filter((c) => c.materialIds.includes(materialId))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.collection}
                    </option>
                  ))}
              </select>
            </label>
            {selected && (
              <div className={styles.selectedTone}>
                <span style={{ background: selected.hex || "#deddd6" }} />
                <div>
                  <strong>{selected.name}</strong>
                  <p>{accuracyLabel(selected)}</p>
                </div>
              </div>
            )}
            <label className={styles.field}>
              03 — Materialvergleich
              <select
                value={secondMaterial}
                onChange={(e) => setSecondMaterial(e.target.value)}
              >
                <option value="">Kein Vergleich</option>
                {catalog.materials
                  .filter((m) => m.id !== materialId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </label>
            <p className={styles.small}>
              Die Produktabbildung bleibt unverändert. Sie zeigt keine
              bestätigte Probe im gewählten Farbton. Technik, Licht und
              Untergrund beeinflussen das Ergebnis.
            </p>
            {selected && (
              <div className={styles.actions}>
                <button
                  className={styles.primary}
                  onClick={() => request(referenceFor(selected))}
                >
                  Farbton anfragen <span aria-hidden="true">＋</span>
                </button>
                <button className={styles.textButton} onClick={addToProject}>
                  Zum Farbprojekt hinzufügen
                </button>
              </div>
            )}
          </div>
          <div
            className={
              secondMaterial ? styles.previewPair : styles.previewSingle
            }
          >
            {[material, ...(other ? [other] : [])].filter(Boolean).map((m) => (
              <figure className={styles.materialPreview} key={m!.id}>
                {m!.image ? (
                  <Image
                    src={m!.image}
                    alt={`${m!.name}: Produktabbildung, keine farbverbindliche Probe`}
                    width={900}
                    height={1000}
                    sizes="(max-width: 767px) 92vw, 45vw"
                  />
                ) : (
                  <div className={styles.previewMissing}>
                    Für dieses Material liegt keine Abbildung vor.
                  </div>
                )}
                <figcaption>
                  <span>{m!.name}</span>
                  <small>PRODUKTABBILDUNG · KEINE FARBPROBE</small>
                </figcaption>
                {m!.image && (
                  <button
                    className={styles.zoomButton}
                    onClick={() => {
                      setZoomedId(m!.id);
                      zoom.current?.showModal();
                    }}
                    aria-label={`${m!.name}: Abbildung vergrößern`}
                  >
                    Vergrößern ＋
                  </button>
                )}
                <Link href={m!.href} className={styles.textLink}>
                  Produktdetails
                </Link>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section
        className={styles.section}
        id="farbreferenz"
        aria-labelledby="matching-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.label}>03 / IHR AUSGANGSPUNKT</p>
          <h2 id="matching-title">
            Ihre Farbe.
            <br />
            <span>Unsere Möglichkeiten.</span>
          </h2>
          <p>
            Eine Erinnerung, ein Fundstück, ein Farbcode. Geben Sie Ihrer Idee
            eine digitale Referenz. Die Machbarkeit prüfen wir gemeinsam.
          </p>
        </div>
        <ImageColourPicker colours={catalog.colours} onRequest={request} />
      </section>
      <section
        className={`${styles.section} ${styles.projectSection}`}
        id="farbprojekt"
        aria-labelledby="project-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.label}>04 / IHRE AUSWAHL</p>
          <h2 id="project-title">
            Gedanken sammeln.
            <br />
            <span>Farben bewahren.</span>
          </h2>
          <p>
            Merkliste und Farbprojekte bleiben auf diesem Gerät. Teilen Sie
            reine Farbreferenzen; persönliche Notizen bleiben privat.
          </p>
        </div>
        {storageError && (
          <p className={styles.error} role="status">
            {storageError}
          </p>
        )}
        <div className={styles.projectLayout}>
          <div>
            <p className={styles.label}>
              MERKLISTE / {saved.favourites.length}
            </p>
            <div className={styles.favouriteList}>
              {saved.favourites
                .map((id) => catalog.colours.find((c) => c.id === id))
                .filter((c): c is TintColour => !!c)
                .map((c) => (
                  <div key={c.id}>
                    <button
                      className={styles.savedColour}
                      onClick={(e) => openDetail(c, e.currentTarget)}
                    >
                      <span style={{ background: c.hex || "#deddd6" }} />
                      {c.name}
                      <small>{c.collection}</small>
                    </button>
                    <button
                      className={styles.iconButton}
                      onClick={() => favourite(c.id)}
                      aria-label={`${c.name} aus Merkliste entfernen`}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
            {!saved.favourites.length && (
              <p className={styles.small}>
                Mit dem Herz im Explorer speichern Sie eine Nuance.
              </p>
            )}
            <button
              className={styles.secondary}
              disabled={saved.projects.length >= 30}
              onClick={() => {
                const id = crypto.randomUUID();
                setSaved((current) => ({
                  ...current,
                  projects: [
                    ...current.projects,
                    {
                      id,
                      name: "Neues Farbprojekt",
                      colourIds: [],
                      materialIds: [],
                      notes: "",
                      updated: new Date().toISOString(),
                    },
                  ],
                }));
                setProjectId(id);
              }}
            >
              Farbprojekt erstellen ＋
            </button>
            <label className={styles.field}>
              Gespeicherte Projekte
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Projekt auswählen</option>
                {saved.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.projectEditor}>
            {project ? (
              <>
                <label className={styles.field}>
                  Projektname
                  <input
                    maxLength={120}
                    value={project.name}
                    onChange={(e) => updateProject({ name: e.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  Persönliche Notizen
                  <textarea
                    maxLength={3000}
                    rows={4}
                    value={project.notes}
                    onChange={(e) => updateProject({ notes: e.target.value })}
                  />
                </label>
                <ul className={styles.projectItems}>
                  {project.colourIds.map((id) => {
                    const c = catalog.colours.find((x) => x.id === id);
                    return (
                      <li key={id}>
                        <span>
                          {c
                            ? `${c.collection} / ${c.name}`
                            : "Nicht mehr im Katalog"}
                        </span>
                        <button
                          className={styles.iconButton}
                          aria-label={`${c?.name || "Farbe"} aus Projekt entfernen`}
                          onClick={() =>
                            updateProject({
                              colourIds: project.colourIds.filter(
                                (x) => x !== id,
                              ),
                            })
                          }
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                  {project.materialIds.map((id) => {
                    const m = catalog.materials.find((x) => x.id === id);
                    return (
                      <li key={id}>
                        <span>
                          Material: {m?.name || "Nicht mehr verfügbar"}
                        </span>
                        <button
                          className={styles.iconButton}
                          aria-label={`${m?.name || "Material"} aus Projekt entfernen`}
                          onClick={() =>
                            updateProject({
                              materialIds: project.materialIds.filter(
                                (x) => x !== id,
                              ),
                            })
                          }
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  className={styles.textButton}
                  onClick={() => {
                    setSaved((current) => ({
                      ...current,
                      projects: current.projects.filter(
                        (p) => p.id !== projectId,
                      ),
                    }));
                    setProjectId("");
                  }}
                >
                  Dieses Projekt löschen
                </button>
              </>
            ) : (
              <p>
                Wählen Sie ein Projekt oder speichern Sie eine Nuance aus dem
                Explorer.
              </p>
            )}
            <div className={styles.actions}>
              <button
                className={styles.secondary}
                onClick={() => void share()}
                disabled={!selected && !project}
              >
                Auswahl teilen
              </button>
              <button
                className={styles.secondary}
                onClick={download}
                disabled={!selected && !project}
              >
                Zusammenfassung exportieren
              </button>
              <button
                className={styles.textButton}
                onClick={() => window.print()}
                disabled={!selected && !project}
              >
                Drucken / als PDF sichern
              </button>
            </div>
            <button
              className={styles.textButton}
              onClick={() => {
                setSaved(emptySaved);
                setSelectedId("");
                setMaterialId("");
                setCompareIds([]);
                setProjectId("");
                setNotice(
                  "Gespeicherte Projekte und Merkliste auf diesem Gerät gelöscht.",
                );
              }}
            >
              Alle gespeicherten Farbdaten löschen
            </button>
          </div>
        </div>
        <div className={styles.printSummary}>
          <h2>VIERO / FARBPROJEKT</h2>
          <h3>{project?.name || "Farbauswahl"}</h3>
          <p>{new Date().toLocaleDateString("de-DE")}</p>
          {(
            project?.colourIds ||
            (compareIds.length && compareIds) || [selectedId]
          )
            .map((id) => catalog.colours.find((c) => c.id === id))
            .filter((c): c is TintColour => !!c)
            .map((c) => (
              <div key={c.id}>
                <span style={{ background: c.hex || "#deddd6" }} />
                <p>
                  {c.collection} / {c.name} {c.code || ""}
                  <br />
                  {accuracyLabel(c)}
                </p>
              </div>
            ))}
          <p>
            Materialien:{" "}
            {(project?.materialIds || [materialId])
              .map((id) => catalog.materials.find((m) => m.id === id)?.name)
              .filter(Boolean)
              .join(", ")}
          </p>
          <p>{project?.notes}</p>
          <p>
            Digitale Vorschau ist keine Freigabe einer physischen
            Tönungsrezeptur.
          </p>
        </div>
      </section>
      <section
        className={`${styles.section} ${styles.enquirySection}`}
        id="anfrage"
        aria-labelledby="enquiry-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.label}>06 / TÖNUNGSANFRAGE</p>
          <h2 id="enquiry-title">
            Ihre Vorstellung.
            <br />
            <span>Unsere Expertise.</span>
          </h2>
          <p>
            Teilen Sie Ihre Idee mit unserem Tönungslabor. Wir prüfen Farbton,
            Material und technische Möglichkeiten persönlich.
          </p>
        </div>
        <TintEnquiry
          materials={catalog.materials}
          reference={reference}
          materialId={materialId}
        />
      </section>
      <dialog
        ref={detail}
        aria-labelledby="tint-detail-title"
        className={styles.colourDialog}
        onClose={() => detailTrigger.current?.focus()}
      >
        <button
          className={styles.dialogClose}
          onClick={() => detail.current?.close()}
          aria-label="Farbdetails schließen"
        >
          ×
        </button>
        {selected && (
          <div className={styles.detailLayout}>
            <div
              className={`${styles.detailColour} ${!selected.hex ? styles.noDigital : ""}`}
              style={{
                background: selected.hex || "#deddd6",
                color: selected.hex ? panelInk(selected.hex) : "#474b43",
              }}
            >
              <span>{selected.code || selected.name}</span>
              <small>{accuracyLabel(selected)}</small>
            </div>
            <div className={styles.detailCopy}>
              <p className={styles.label}>{selected.collection}</p>
              <h2 id="tint-detail-title">{selected.name}</h2>
              <p>{selected.family}</p>
              <p className={styles.small}>
                {accuracyLabel(selected)}. Ein Bildschirmwert ersetzt keine
                physische Materialprobe.
              </p>
              <h3>Im Produktkatalog geführt für</h3>
              <ul>
                {catalog.materials
                  .filter((m) => selected.materialIds.includes(m.id))
                  .map((m) => (
                    <li key={m.id}>
                      <Link className={styles.textLink} href={m.href}>
                        {m.name}
                      </Link>
                    </li>
                  ))}
              </ul>
              <p className={styles.small}>
                Katalogzuordnung ist keine Zusage einer individuellen
                Tönungsrezeptur.
              </p>
              <div className={styles.actions}>
                <button
                  className={styles.secondary}
                  aria-pressed={saved.favourites.includes(selected.id)}
                  onClick={() => favourite(selected.id)}
                >
                  {saved.favourites.includes(selected.id)
                    ? "♥ Gemerkt"
                    : "♡ Merken"}
                </button>
                <button className={styles.secondary} onClick={addToProject}>
                  Zum Farbprojekt
                </button>
                <button
                  className={styles.primary}
                  onClick={() => {
                    detail.current?.close();
                    request(referenceFor(selected));
                  }}
                >
                  Diesen Farbton anfragen ＋
                </button>
                <button
                  className={styles.textButton}
                  onClick={() => {
                    detail.current?.close();
                    document
                      .getElementById("studio")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Im Materialstudio ansehen
                </button>
              </div>
              <h3>Weitere Nuancen der Kollektion</h3>
              <div className={styles.related}>
                {catalog.colours
                  .filter(
                    (c) =>
                      c.collection === selected.collection &&
                      c.id !== selected.id,
                  )
                  .slice(0, 4)
                  .map((c) => (
                    <button key={c.id} onClick={() => select(c)}>
                      <span style={{ background: c.hex || "#deddd6" }} />
                      {c.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </dialog>
      <dialog
        ref={zoom}
        aria-label="Materialabbildung vergrößert"
        className={styles.zoomDialog}
      >
        <button
          className={styles.dialogClose}
          onClick={() => zoom.current?.close()}
          aria-label="Vergrößerung schließen"
        >
          ×
        </button>
        {zoomedMaterial?.image && (
          <Image
            src={zoomedMaterial.image}
            alt={`${zoomedMaterial.name}: Produktabbildung, keine farbverbindliche Probe`}
            width={1600}
            height={1600}
            sizes="95vw"
          />
        )}
        <p>{zoomedMaterial?.name} / Produktabbildung, keine Farbprobe</p>
      </dialog>
    </>
  );
}
