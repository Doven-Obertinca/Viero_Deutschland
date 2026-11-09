"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  matches,
  type CatalogItem,
  type Selection,
} from "@/lib/catalog/filters";
import { ProductMedia } from "./media";
import styles from "./product-catalog.module.css";
const priceBands = [
  { label: "Unter 50 €", value: "0:50" },
  { label: "50 bis 100 €", value: "50:100" },
  { label: "100 bis 200 €", value: "100:200" },
  { label: "Ab 200 €", value: "200:Infinity" },
];
const priority = (name: string) => {
  const order = [
    "Einsatzbereich",
    "Zimmer",
    "Fläche",
    "Produktart",
    "Farbton",
    "Gebindegröße",
  ];
  const index = order.indexOf(name);
  return index < 0 ? order.length : index;
};
export function ProductCatalog({
  items,
  currency,
  taxState,
  initialQuery = "",
}: {
  items: CatalogItem[];
  currency: string;
  taxState?: string;
  initialQuery?: string;
}) {
  const resultsRef = useRef<HTMLElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState("Einsatzbereich");
  const [filterOpen, setFilterOpen] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const update = () => setFilterOpen(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const [selection, setSelection] = useState<Selection>({});
  const [query, setQuery] = useState(initialQuery);
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("featured");
  const [limit, setLimit] = useState(24);
  const facets = useMemo(() => {
    const groups = new Map<string, Set<string>>([
      ["Einsatzbereich", new Set(["Innenbereich", "Außenbereich"])],
      [
        "Zimmer",
        new Set(["Wohnzimmer", "Schlafzimmer", "Flur", "Küche", "Badezimmer"]),
      ],
      ["Fläche", new Set(["Wand", "Boden", "Treppe", "Fassade"])],
    ]);
    items.forEach((item) =>
      Object.entries(item.facets).forEach(([group, values]) => {
        if (!groups.has(group)) groups.set(group, new Set());
        values.forEach((value) => groups.get(group)!.add(value));
      }),
    );
    return [...groups].sort(
      ([a], [b]) => priority(a) - priority(b) || a.localeCompare(b, "de"),
    );
  }, [items]);
  const filtered = items
    .filter((item) => matches(item, selection, query, price, available))
    .map((item) => {
      const prices = item.variants
        ?.filter((variant) =>
          matches(variant, selection, query, price, available),
        )
        .flatMap((variant) =>
          variant.price === undefined ? [] : [variant.price],
        );
      return prices?.length ? { ...item, price: Math.min(...prices) } : item;
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "de");
      if (sort === "low" || sort === "high") {
        if (a.price === undefined) return b.price === undefined ? 0 : 1;
        if (b.price === undefined) return -1;
        return sort === "low" ? a.price - b.price : b.price - a.price;
      }
      return 0;
    });
  const format = (value: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(
      value,
    );
  const toggle = (group: string, value: string) => {
    setLimit(24);
    setSelection((current) => ({
      ...current,
      [group]: current[group]?.includes(value)
        ? current[group].filter((v) => v !== value)
        : [...(current[group] || []), value],
    }));
  };
  const clear = () => {
    setSelection({});
    setQuery("");
    setPrice("");
    setAvailable(false);
    setLimit(24);
  };
  const active =
    Object.values(selection).flat().length +
    Number(!!price) +
    Number(available) +
    Number(!!query);
  const featured = items.filter((item) => item.image).slice(0, 3);
  return (
    <div className={styles.catalog}>
      <section className={styles.hero} aria-labelledby="catalog-title">
        <div className={styles.intro}>
          <nav className={styles.breadcrumb} aria-label="Brotkrümelnavigation">
            <Link href="/">Start</Link>
            <span>/</span>
            <span>Kollektion</span>
          </nav>
          <p className={styles.eyebrow}>VIERO DECORATIVES · MADE IN ITALY</p>
          <h1 id="catalog-title">Die Kollektion.</h1>
          <p>
            Italienische Farben und dekorative Oberflächen.
            <br />
            Finden Sie das richtige Material für Ihr Projekt.
          </p>
          <div className={styles.heroLinks}>
            <a href="#catalog-products">
              Kollektion entdecken <span aria-hidden="true">＋</span>
            </a>
            <Link href="/showroom">Persönliche Beratung</Link>
          </div>
        </div>
        {!!featured.length && (
          <div
            className={styles.heroArt}
            aria-label="Einblicke in die Kollektion"
          >
            {featured.map((item, index) => {
              const palette = [
                { name: "Soft Beige", colour: "#e4dac8" },
                { name: "Linen", colour: "#d0c8b8" },
                { name: "Sage Green", colour: "#a0a793" },
              ][index];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={styles.artTile}
                  aria-label={`${item.name} entdecken`}
                >
                  <div
                    className={styles.heroSwatch}
                    style={{ backgroundColor: palette.colour }}
                    aria-hidden="true"
                  />
                  <div className={styles.swatchCaption}>
                    <span className={styles.swatchEyebrow}>
                      FARBINSPIRATION / 0{index + 1}
                    </span>
                    <span className={styles.swatchTitle}>{palette.name}</span>
                    <span className={styles.swatchProduct}>
                      {item.name}
                      <span aria-hidden="true">＋</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      <div className={styles.layout} id="catalog-products">
        <aside className={styles.sidebar} aria-label="Produkte filtern">
          <details
            className={styles.filterPanel}
            open={filterOpen}
            onToggle={(event) => setFilterOpen(event.currentTarget.open)}
          >
            <summary>
              <span className={styles.filterLabel}>
                Filter{" "}
                <span className={styles.filterCount}>{active || ""}</span>
              </span>
              <span className={styles.filterSummary}>
                {filterOpen ? "Schließen" : "Produkte filtern"}
                <span className={styles.filterChevron} aria-hidden="true">
                  ⌄
                </span>
              </span>
            </summary>
            <div className={styles.filterBody}>
              <label className={styles.search}>
                Produkt suchen
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setLimit(24);
                  }}
                  placeholder="Name oder Eigenschaft"
                />
              </label>
              <div
                className={styles.filterTabs}
                role="tablist"
                aria-label="Filtergruppen"
              >
                {[...facets.map(([group]) => group), "Preis"].map(
                  (group, index, groups) => (
                    <button
                      key={group}
                      type="button"
                      role="tab"
                      id={`filter-tab-${index}`}
                      aria-selected={activeFilter === group}
                      aria-controls="filter-options"
                      tabIndex={activeFilter === group ? 0 : -1}
                      onClick={() => setActiveFilter(group)}
                      onKeyDown={(event) => {
                        let next = index;
                        if (
                          event.key === "ArrowRight" ||
                          event.key === "ArrowDown"
                        )
                          next = (index + 1) % groups.length;
                        else if (
                          event.key === "ArrowLeft" ||
                          event.key === "ArrowUp"
                        )
                          next = (index - 1 + groups.length) % groups.length;
                        else if (event.key === "Home") next = 0;
                        else if (event.key === "End") next = groups.length - 1;
                        else return;
                        event.preventDefault();
                        setActiveFilter(groups[next]);
                        document.getElementById(`filter-tab-${next}`)?.focus();
                      }}
                    >
                      {group}
                      {!!selection[group]?.length && (
                        <small>{selection[group].length}</small>
                      )}
                    </button>
                  ),
                )}
              </div>
              <div
                id="filter-options"
                role="tabpanel"
                aria-labelledby={`filter-tab-${[...facets.map(([group]) => group), "Preis"].indexOf(activeFilter)}`}
              >
                {facets
                  .filter(([group]) => group === activeFilter)
                  .map(([group, values]) => (
                    <div className={styles.facet} key={group}>
                      <h2 className={styles.filterHeading}>{group}</h2>
                      <div className={styles.options}>
                        {[...values]
                          .sort((a, b) =>
                            a.localeCompare(b, "de", { numeric: true }),
                          )
                          .filter(
                            (value, index) =>
                              index < 8 ||
                              expandedGroups.includes(group) ||
                              selection[group]?.includes(value),
                          )
                          .map((value) => {
                            const count = items.filter((item) =>
                              matches(
                                item,
                                { ...selection, [group]: [value] },
                                query,
                                price,
                                available,
                              ),
                            ).length;
                            const checked =
                              selection[group]?.includes(value) || false;
                            return (
                              <label
                                key={value}
                                className={styles.option}
                                data-disabled={!count && !checked}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={!count && !checked}
                                  onChange={() => toggle(group, value)}
                                />
                                <span>{value}</span>
                                <small>{count}</small>
                              </label>
                            );
                          })}
                      </div>
                      {values.size > 8 && (
                        <button
                          type="button"
                          className={styles.showOptions}
                          onClick={() =>
                            setExpandedGroups((current) =>
                              current.includes(group)
                                ? current.filter((value) => value !== group)
                                : [...current, group],
                            )
                          }
                        >
                          {expandedGroups.includes(group)
                            ? "Weniger anzeigen"
                            : `Alle ${values.size} anzeigen`}
                          <span aria-hidden="true">
                            {expandedGroups.includes(group) ? "−" : "+"}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                {activeFilter === "Preis" && (
                  <fieldset className={styles.price}>
                    <legend>Preis pro Gebinde</legend>
                    <label>
                      <input
                        type="radio"
                        name="price"
                        checked={!price}
                        onChange={() => {
                          setPrice("");
                          setLimit(24);
                        }}
                      />{" "}
                      Alle Preise
                    </label>
                    {priceBands.map((band) => (
                      <label key={band.value}>
                        <input
                          type="radio"
                          name="price"
                          checked={price === band.value}
                          onChange={() => {
                            setPrice(band.value);
                            setLimit(24);
                          }}
                        />
                        {band.label}
                        <small>
                          {
                            items.filter((item) =>
                              matches(
                                item,
                                selection,
                                query,
                                band.value,
                                available,
                              ),
                            ).length
                          }
                        </small>
                      </label>
                    ))}
                  </fieldset>
                )}
                {["Einsatzbereich", "Zimmer", "Fläche"].includes(
                  activeFilter,
                ) && (
                  <p className={styles.applicationNote}>
                    Zuordnung nach Herstellerangaben. In Bad und Küche den
                    vorgesehenen Systemaufbau und die Versiegelung beachten.
                    Oltre-Produkte sind Komponenten eines Gesamtsystems.
                  </p>
                )}
              </div>
              <label className={styles.stock}>
                <span>Nur verfügbare Produkte</span>
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => {
                    setAvailable(e.target.checked);
                    setLimit(24);
                  }}
                />
              </label>
              {!!active && (
                <button className={styles.reset} onClick={clear}>
                  Alle Filter zurücksetzen
                </button>
              )}
              <button
                type="button"
                className={styles.showResults}
                onClick={() => {
                  setFilterOpen(false);
                  requestAnimationFrame(() => {
                    resultsRef.current?.focus({ preventScroll: true });
                    resultsRef.current?.scrollIntoView({
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "instant"
                        : "smooth",
                      block: "start",
                    });
                  });
                }}
              >
                {filtered.length}{" "}
                {filtered.length === 1 ? "Produkt" : "Produkte"} anzeigen
                <span aria-hidden="true">＋</span>
              </button>
              <div className={styles.help}>
                <span>Das passende Material?</span>
                <p>
                  Wir beraten Sie zu Oberfläche, Verarbeitung und
                  Materialbedarf.
                </p>
                <Link href="/showroom">
                  Beratung im Showroom <span aria-hidden="true">＋</span>
                </Link>
              </div>
            </div>
          </details>
        </aside>
        <section
          ref={resultsRef}
          tabIndex={-1}
          className={styles.results}
          aria-label="Produktkollektion"
        >
          <div className={styles.toolbar}>
            <p role="status" aria-live="polite">
              <strong>{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "Produkt" : "Produkte"}
            </p>
            <label>
              Sortieren nach
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Empfohlen</option>
                <option value="name">Name A–Z</option>
                <option value="low">Preis aufsteigend</option>
                <option value="high">Preis absteigend</option>
              </select>
            </label>
          </div>
          {!!active && (
            <div className={styles.chips}>
              {Object.entries(selection).flatMap(([group, values]) =>
                values.map((value) => (
                  <button
                    key={`${group}:${value}`}
                    onClick={() => toggle(group, value)}
                    aria-label={`${group}: ${value} entfernen`}
                  >
                    {value}
                    <span aria-hidden="true">×</span>
                  </button>
                )),
              )}
              {!!price && (
                <button onClick={() => setPrice("")}>
                  {priceBands.find((b) => b.value === price)?.label} ×
                </button>
              )}
              {available && (
                <button onClick={() => setAvailable(false)}>Verfügbar ×</button>
              )}
              {query && (
                <button onClick={() => setQuery("")}>Suche: {query} ×</button>
              )}
            </div>
          )}
          <div className={styles.grid}>
            {filtered.slice(0, limit).map((item) => (
              <article className={styles.card} key={item.id}>
                <Link href={item.href} className={styles.cardImage}>
                  <ProductMedia src={item.image} alt={item.alt} />
                  {item.available === false && (
                    <span className={styles.unavailable}>
                      Zurzeit nicht verfügbar
                    </span>
                  )}
                </Link>
                <div className={styles.cardInfo}>
                  <Link href={item.href}>
                    <h2>{item.name}</h2>
                  </Link>
                  <p>{item.subtitle || "Viero Decoratives · Made in Italy"}</p>
                  <div className={styles.cardBottom}>
                    <div>
                      <strong>
                        {item.price !== undefined
                          ? `${item.fromPrice ? "ab " : ""}${format(item.price)}`
                          : "Preis auf Anfrage"}
                      </strong>
                      <small>
                        {item.price !== undefined
                          ? taxState === "gross"
                            ? "inkl. MwSt. · zzgl. Versand"
                            : taxState === "net"
                              ? "zzgl. MwSt. und Versand"
                              : "exkl. MwSt. · zzgl. Versand"
                          : "Persönliche Beratung"}
                      </small>
                    </div>
                    <Link
                      className={styles.plus}
                      href={item.href}
                      aria-label={`${item.name} ansehen`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <div className={styles.empty}>
              <h2>
                {items.length
                  ? "Keine passenden Produkte"
                  : "Die Kollektion wird vorbereitet."}
              </h2>
              <p>
                {items.length
                  ? "Versuchen Sie eine andere Auswahl oder setzen Sie die Filter zurück."
                  : "Entdecken Sie unsere Materialien bei einer persönlichen Beratung."}
              </p>
              {items.length ? (
                <button onClick={clear}>Filter zurücksetzen</button>
              ) : (
                <Link href="/showroom">Zum Showroom</Link>
              )}
            </div>
          )}
          {filtered.length > limit && (
            <button
              className={styles.loadMore}
              onClick={() => setLimit((current) => current + 24)}
            >
              Weitere Produkte anzeigen{" "}
              <span>
                {Math.min(limit, filtered.length)} / {filtered.length}
              </span>
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
