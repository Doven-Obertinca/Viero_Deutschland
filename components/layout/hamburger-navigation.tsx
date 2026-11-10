"use client";
import { usePathname } from "next/navigation";
import { SocialIcon } from "./social-icon";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./hamburger-navigation.module.css";

type NavigationItem = { id: string; name: string; href: string };
const destinations = [
  ["/", "Startseite"],
  ["/produkte", "Produkte"],
  ["/raumvisualisierer", "Raumvisualisierer"],
  ["/toenung", "Tönung"],
  ["/akademie", "Akademie"],
  ["/showroom", "Showroom"],
  ["/ueber-uns", "Über uns"],
  ["/#inspiration", "Inspiration"],
  ["/kontakt", "Kontakt"],
] as const;

export function HamburgerNavigation({
  items,
  social,
}: {
  items: NavigationItem[];
  social: { title: string; href: string }[];
}) {
  const pathname = usePathname();
  const links = [
    ...destinations.map(([href, name]) => ({ href, name })),
    ...items.filter(
      (item) => !destinations.some(([href]) => href === item.href),
    ),
  ];
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const [imageReady, setImageReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );
  function show() {
    const menu = dialog.current;
    if (!menu || menu.open) return;
    menu.showModal();
    // Establish the offscreen position before React applies the open state.
    menu.getBoundingClientRect();
    setPresent(true);
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
        aria-label="Hauptmenü"
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
        <div className={styles.scene} aria-hidden="true">
          <Image
            src="/brand/navigation/marmorin-sand.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={90}
            loading="eager"
            data-ready={imageReady}
            onLoad={() => setImageReady(true)}
          />
          <div className={styles.wordmark}>
            <BrandLogo />
          </div>
          <div className={styles.editorial}>
            <span>ITALIAN SURFACE CULTURE</span>
            <p>
              Material.
              <br />
              Emotion.
              <br />
              Viero.
            </p>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.controls}>
            <button
              className={styles.trigger}
              aria-label="Menü schließen"
              onClick={close}
              autoFocus
            >
              <span className={styles.label}>MENÜ</span>
              <span
                className={`${styles.icon} ${styles.closeIcon}`}
                aria-hidden="true"
              >
                <span />
                <span />
              </span>
            </button>
          </div>
          <nav aria-label="Hauptnavigation" className={styles.navigation}>
            {links.map(({ href, name }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={styles.navLink}
                aria-current={pathname === href ? "page" : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
          {social.length > 0 && (
            <div className={styles.social}>
              {social.map(({ title, href }) => (
                <a key={title} href={href} aria-label={title}>
                  <SocialIcon name={title} />
                </a>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
