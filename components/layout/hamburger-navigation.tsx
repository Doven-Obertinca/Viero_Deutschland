"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./hamburger-navigation.module.css";

type NavigationItem = { id: string; name: string; href: string };
export function HamburgerNavigation({ items }: { items: NavigationItem[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );
  function show() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPresent(true);
    dialog.current?.showModal();
    setOpen(true);
  }
  function close() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(false);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    closeTimer.current = setTimeout(
      () => {
        dialog.current?.close();
        trigger.current?.focus({ preventScroll: true });
      },
      reduced ? 0 : 480,
    );
  }
  useEffect(() => {
    if (!present) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [present]);
  return (
    <>
      <button
        ref={trigger}
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="dialog"
        aria-label="Menü öffnen"
        onClick={show}
      >
        <span className={styles.label}>MENÜ</span>
        <span className={styles.icon} aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
      <dialog
        ref={dialog}
        id={id}
        className={styles.dialog}
        data-open={open}
        aria-labelledby={`${id}-title`}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        onClose={() => {
          setOpen(false);
          setPresent(false);
        }}
      >
        <div className={styles.panel}>
          <div className={styles.topbar}>
            <span className={styles.wordmark}>
              VIERO<span>DEUTSCHLAND</span>
            </span>
            <button
              className={styles.trigger}
              aria-label="Menü schließen"
              onClick={close}
              autoFocus
            >
              <span className={styles.label}>SCHLIESSEN</span>
              <span
                className={`${styles.icon} ${styles.closeIcon}`}
                aria-hidden="true"
              >
                <span />
                <span />
              </span>
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.editorial}>
              <span>ITALIAN SURFACE CULTURE</span>
              <p>
                Material.
                <br />
                Emotion.
                <br />
                <em>Viero.</em>
              </p>
              <span>
                Made in Italy.
                <br />
                Für Räume mit Charakter.
              </span>
              <div className={styles.cut} aria-hidden="true" />
            </div>
            <nav aria-label="Hauptnavigation" className={styles.navigation}>
              <h2 id={`${id}-title`}>ENTDECKEN SIE VIERO</h2>
              {[{ id: "home", name: "Startseite", href: "/" }, ...items].map(
                (item, index) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={close}
                    className={styles.navLink}
                    style={{ "--item-index": index } as React.CSSProperties}
                  >
                    <span className={styles.number}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.name}</span>
                    <span className={styles.arrow} aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                ),
              )}
            </nav>
          </div>
          <div className={styles.bottom}>
            <span>DEKORATIVE OBERFLÄCHEN. ITALIENISCHE HANDWERKSKUNST.</span>
            <Link href="/produkte" onClick={close}>
              Die Kollektion entdecken ↗
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
