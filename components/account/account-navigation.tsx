"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "@/app/konto/actions";
import styles from "./account.module.css";
export function AccountNavigation({ signedIn }: { signedIn: boolean }) {
  const details = useRef<HTMLDetailsElement>(null);
  const dismiss = () => {
    if (details.current) details.current.open = false;
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !details.current?.contains(event.target)
      )
        dismiss();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <details
      ref={details}
      className={styles.accountMenu}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          dismiss();
          details.current?.querySelector("summary")?.focus();
        }
      }}
    >
      <summary
        aria-label={signedIn ? "Mein Kundenkonto" : "Anmelden und registrieren"}
      >
        <span className={styles.accountText}>
          {signedIn ? "MEIN KONTO" : "ANMELDEN"}
        </span>
        <span className={styles.accountIcon}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
          </svg>
        </span>
      </summary>
      <div className={styles.dropdown}>
        <p>Ihr Viero Kundenkonto</p>
        {signedIn ? (
          <>
            <Link href="/konto" onClick={dismiss}>
              Mein Konto
            </Link>
            <form action={signOut}>
              <button type="submit">Abmelden</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/konto/anmelden" onClick={dismiss}>
              Anmelden
            </Link>
            <Link href="/konto/registrieren" onClick={dismiss}>
              Registrieren
            </Link>
          </>
        )}
      </div>
    </details>
  );
}
