"use client";

import Link from "next/link";
import { Suspense, use, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { matches, type CatalogItem } from "@/lib/catalog/filters";
import styles from "./product-search.module.css";

// The shared root layout keeps this header slot mounted across navigation.
const subscribeToHeaderSlot = () => () => {};
const getHeaderSlot = () => document.getElementById("header-product-search");
const getServerHeaderSlot = () => null;
const suggestedTerms = ["Erametal", "Kalkputz", "Badezimmer", "Wand", "Boden"];

export function ProductSearch({
  items,
}: {
  items: Promise<CatalogItem[] | undefined>;
}) {
  const [query, setQuery] = useState("");
  const triggerSlot = useSyncExternalStore(
    subscribeToHeaderSlot,
    getHeaderSlot,
    getServerHeaderSlot,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const term = query.trim();

  return (
    <>
      {triggerSlot &&
        createPortal(
          <button
            className={styles.trigger}
            type="button"
            aria-label="Produktsuche öffnen"
            aria-haspopup="dialog"
            onClick={() => {
              dialog.current?.showModal();
              input.current?.focus();
            }}
          >
            <SearchIcon />
          </button>,
          triggerSlot,
        )}
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="product-search-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className={styles.panel}>
          <div className={styles.heading}>
            <div>
              <p>VIERO KATALOG</p>
              <h2 id="product-search-title">
                Produkte <strong>finden</strong>
              </h2>
            </div>
            <button
              className={styles.close}
              type="button"
              aria-label="Produktsuche schließen"
              onClick={() => dialog.current?.close()}
            >
              <span aria-hidden="true">ESC</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <form
            className={styles.form}
            action="/produkte#catalog-products"
            role="search"
            aria-label="Produktsuche"
            onSubmit={(event) => {
              if (!term) {
                event.preventDefault();
                input.current?.focus();
              }
            }}
          >
            <button type="submit" aria-label="Produkte suchen">
              <SearchIcon />
            </button>
            <input
              ref={input}
              aria-label="Produktname oder Eigenschaft"
              name="q"
              type="search"
              placeholder="Produkt, Oberfläche oder Farbwelt suchen …"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          {!term && (
            <div className={styles.suggestions}>
              <p>Beliebte Suchanfragen</p>
              <ul>
                {suggestedTerms.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(suggestion);
                        input.current?.focus();
                      }}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Suspense fallback={null}>
            <SearchSuggestions items={items} term={term} />
          </Suspense>
        </div>
      </dialog>
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6" />
      <path d="m15.2 15.2 4.4 4.4" />
    </svg>
  );
}

function SearchSuggestions({
  items,
  term,
}: {
  items: Promise<CatalogItem[] | undefined>;
  term: string;
}) {
  const catalogue = use(items);
  const results =
    term.length >= 2
      ? catalogue
          ?.filter((item) => matches(item, {}, term, "", false))
          .slice(0, 5)
      : undefined;

  return (
    <>
      <div role="status" className={styles.status}>
        {results &&
          (results.length > 0
            ? `Produktvorschläge: ${results.length}`
            : "Keine passenden Produkte gefunden.")}
      </div>
      {!!results?.length && (
        <ul className={styles.results} aria-label="Produktvorschläge">
          {results.map((item) => (
            <li key={item.id}>
              <Link href={item.href} prefetch={false}>
                <span>{item.name}</span>
                <small>{item.subtitle}</small>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
