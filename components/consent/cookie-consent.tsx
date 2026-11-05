"use client";
import { useSyncExternalStore, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  allChoices,
  normalizeChoices,
  type ConsentChoices,
  type ConsentConfig,
} from "@/lib/content/cookie-model";
import {
  CONSENT_COOKIE,
  consentWrites,
  readConsent,
  consentDays,
} from "@/lib/content/consent-policy";
import styles from "./cookie-consent.module.css";
function subscribe(listener: () => void) {
  window.addEventListener("viero:consent-change", listener);
  window.addEventListener("focus", listener);
  return () => {
    window.removeEventListener("viero:consent-change", listener);
    window.removeEventListener("focus", listener);
  };
}
function cookieSnapshot() {
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
      ?.slice(CONSENT_COOKIE.length + 1) || ""
  );
}
export function CookieConsent({
  config,
  privacyHref,
  initialCookie = "",
}: {
  config: ConsentConfig;
  privacyHref?: string;
  initialCookie?: string;
}) {
  const snapshot = useSyncExternalStore(
    subscribe,
    cookieSnapshot,
    () => initialCookie,
  );
  const saved = readConsent(snapshot, config);
  const pathname = usePathname();
  const visible = !saved && pathname !== "/cookies";
  const [choices, setChoices] = useState<ConsentChoices>(() =>
    allChoices(config.groups, false),
  );
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    opener = useRef<HTMLElement | null>(null);
  function open() {
    setChoices(saved || allChoices(config.groups, false));
    opener.current = document.activeElement as HTMLElement;
    dialog.current?.showModal();
  }
  function close() {
    dialog.current?.close();
    if (opener.current?.isConnected) opener.current.focus();
    else trigger.current?.focus();
  }
  function save(input: ConsentChoices) {
    if (!config.available) return;
    const selected = normalizeChoices(config.groups, input);
    for (const entry of consentWrites(config, selected))
      document.cookie = `${entry.name}=${encodeURIComponent(entry.value)}; Path=/; Max-Age=${entry.maxAge}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.trim().split("=")[0];
      if (
        (!selected["google-analytics-enabled"] &&
          /^(?:_ga(?:_|$)|_swag_ga)/.test(name)) ||
        (!selected["google-ads-enabled"] && /^_gcl_/.test(name)) ||
        (!selected["_swa_consent_enabled"] && /^_swa_/.test(name))
      ) {
        document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
      }
    }
    if (!selected["_swa_consent_enabled"]) {
      try {
        localStorage.removeItem("_swa_anonymousId");
        localStorage.removeItem("_swa_userTraits");
      } catch {}
    }
    setChoices(selected);
    if (dialog.current?.open) close();
    window.dispatchEvent(
      new CustomEvent("viero:consent-change", { detail: selected }),
    );
  }
  return (
    <>
      <button
        type="button"
        className={styles.footerButton}
        ref={trigger}
        onClick={open}
      >
        Cookie-Einstellungen
      </button>
      <noscript>
        <style>{`.${styles.banner}{display:none}`}</style>
        <a href="/cookies">Cookie-Einstellungen ohne JavaScript</a>
      </noscript>
      {visible && (
        <section className={styles.banner} aria-label="Cookie-Voreinstellungen">
          <div>
            <p className={styles.eyebrow}>IHRE PRIVATSPHÄRE</p>
            <h2>Ihre Auswahl. Ihr Besuch.</h2>
            <p>
              {config.description ||
                "Aktuell sind nur erforderliche Funktionen verfügbar."}{" "}
              {privacyHref && <a href={privacyHref}>Datenschutz lesen</a>}
            </p>
          </div>
          <div className={styles.buttons}>
            <button
              type="button"
              disabled={!config.available}
              onClick={() => save(allChoices(config.groups, true))}
            >
              Alle akzeptieren
            </button>
            <button
              type="button"
              disabled={!config.available}
              onClick={() => save(allChoices(config.groups, false))}
            >
              Nur erforderliche
            </button>
            <button type="button" onClick={open}>
              Einstellungen
            </button>
          </div>
        </section>
      )}
      <dialog
        className={styles.dialog}
        ref={dialog}
        aria-labelledby="cookie-settings-title"
        onCancel={() => {
          if (opener.current?.isConnected) opener.current.focus();
        }}
      >
        <header>
          <div>
            <p className={styles.eyebrow}>VIERO / PRIVATSPHÄRE</p>
            <h2 id="cookie-settings-title">Cookie-Einstellungen</h2>
          </div>
          <button type="button" onClick={close}>
            Schließen
          </button>
        </header>
        <p className={styles.description}>{config.description}</p>
        {!config.available && (
          <p role="status">
            Die Einstellungen aus Shopware sind derzeit nicht verfügbar. Es
            werden keine optionalen Dienste aktiviert.
          </p>
        )}
        <div className={styles.groups}>
          {config.groups.map((group) => (
            <section key={group.id} className={styles.group}>
              <label className={styles.groupHeading}>
                <span>
                  {group.title}
                  {group.required && <small>Immer aktiv</small>}
                </span>
                <input
                  type="checkbox"
                  checked={
                    group.required ||
                    group.entries.every((e) => choices[e.name])
                  }
                  disabled={group.required}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setChoices((previous) => ({
                      ...previous,
                      ...Object.fromEntries(
                        group.entries.map((entry) => [
                          entry.name,
                          entry.required || checked,
                        ]),
                      ),
                    }));
                  }}
                />
              </label>
              {group.description && <p>{group.description}</p>}
              <details>
                <summary>Cookies und Details</summary>
                <ul>
                  {group.entries.map((entry) => (
                    <li key={entry.name}>
                      <label>
                        <input
                          type="checkbox"
                          disabled={entry.required}
                          checked={entry.required || !!choices[entry.name]}
                          onChange={(e) =>
                            setChoices({
                              ...choices,
                              [entry.name]: e.target.checked,
                            })
                          }
                        />
                        <span>
                          {entry.label}
                          <code>{entry.name}</code>
                        </span>
                      </label>
                      {entry.description && <p>{entry.description}</p>}
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          ))}
        </div>
        <p className={styles.note}>
          Ihre Auswahl wird für {consentDays(config)} Tage auf dieser Website
          gespeichert. Sie können sie jederzeit im Footer ändern.{" "}
          {privacyHref && <a href={privacyHref}>Datenschutz</a>}{" "}
          <a href="/cookies">Alle Details anzeigen</a>
        </p>
        <footer className={styles.buttons}>
          <button
            type="button"
            disabled={!config.available}
            onClick={() => save(allChoices(config.groups, true))}
          >
            Alle akzeptieren
          </button>
          <button
            type="button"
            disabled={!config.available}
            onClick={() => save(allChoices(config.groups, false))}
          >
            Nur erforderliche
          </button>
          <button
            type="button"
            disabled={!config.available}
            onClick={() => save(choices)}
          >
            Auswahl speichern
          </button>
        </footer>
      </dialog>
    </>
  );
}
