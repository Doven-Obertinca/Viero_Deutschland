"use client";
import {
  useActionState,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { submitInformation } from "@/app/informationen/[id]/actions";
import { submitShowroom } from "@/app/showroom/actions";
import type { EnquiryState } from "@/lib/shopware/showroom-enquiry";
import type { ShowroomFormDefinition } from "@/lib/home/showroom-form";
import showroomStyles from "./showroom-page.module.css";
import shopwareStyles from "./shopware-form.module.css";

const contactStyles = { ...showroomStyles, ...shopwareStyles };

export function EnquiryForm({
  definition,
  categoryId,
  submitAction,
  copy,
  shopwareLayout = false,
  privacyContent,
  privacyHref = "/showroom/datenschutz",
}: {
  definition: ShowroomFormDefinition;
  categoryId?: string;
  submitAction?: (state: EnquiryState, data: FormData) => Promise<EnquiryState>;
  copy?: {
    requiredNote: string;
    submitLabel: string;
    returnHref: string;
    returnLabel: string;
  };
  privacyHref?: string;
  shopwareLayout?: boolean;
  privacyContent?: ReactNode;
}) {
  const submit = useMemo(
    () =>
      submitAction ??
      (categoryId ? submitInformation.bind(null, categoryId) : submitShowroom),
    [categoryId, submitAction],
  );
  const [state, action, pending] = useActionState(submit, {});
  const notice = useRef<HTMLDivElement>(null);
  const privacyDialog = useRef<HTMLDialogElement>(null);
  const styles = shopwareLayout ? contactStyles : showroomStyles;
  useEffect(() => {
    if (state.error || state.success) notice.current?.focus();
  }, [state]);
  if (state.success)
    return (
      <div
        ref={notice}
        className={styles.confirmation}
        role="status"
        tabIndex={-1}
      >
        <span className={styles.label}>ANFRAGE GESENDET</span>
        <h3>{state.success}</h3>
        {!copy && <p>Wir melden uns bei Ihnen.</p>}
        <a href={copy?.returnHref ?? "/showroom"}>
          {copy?.returnLabel ?? "Zurück zum Showroom"}
        </a>
      </div>
    );
  return (
    <form action={action} className={styles.form} aria-busy={pending}>
      {state.error && (
        <div ref={notice} role="alert" tabIndex={-1} className={styles.error}>
          <p>{state.error}</p>
          {state.errors && (
            <ul>
              {Object.entries(state.errors).map(([name, message]) => (
                <li key={name}>
                  {name === "form" ? (
                    message
                  ) : (
                    <a href={`#enquiry-${name}`}>{message}</a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className={styles.fields}>
        {definition.fields.map((field) => {
          const id = `enquiry-${field.name}`;
          const error = state.errors?.[field.name];
          const autocomplete = /vorname/i.test(field.name)
            ? "given-name"
            : /nachname/i.test(field.name)
              ? "family-name"
              : field.type === "email"
                ? "email"
                : /telefon/i.test(field.name)
                  ? "tel"
                  : undefined;
          const common = {
            id,
            name: field.name,
            required: field.required,
            "aria-invalid": !!error,
            "aria-describedby": error ? `${id}-error` : undefined,
            defaultValue: state.values?.[field.name] || "",
          };
          return (
            <div
              className={styles.field}
              data-width={field.width}
              key={field.name}
            >
              <label htmlFor={id}>
                {field.label}
                {field.required && <span aria-hidden="true"> *</span>}
              </label>
              {field.type === "select" ? (
                <select {...common}>
                  <option value="" disabled>
                    {shopwareLayout
                      ? "Option auswählen ..."
                      : "Bitte auswählen"}
                  </option>
                  {field.options.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  {...common}
                  placeholder={field.placeholder}
                  rows={5}
                  maxLength={10000}
                />
              ) : (
                <input
                  {...common}
                  type={/telefon/i.test(field.name) ? "tel" : field.type}
                  placeholder={field.placeholder}
                  autoComplete={autocomplete}
                  maxLength={10000}
                />
              )}
              {error && (
                <p className={styles.fieldError} id={`${id}-error`}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="surname-confirm">Dieses Feld leer lassen</label>
        <input
          id="surname-confirm"
          name="shopware_surname_confirm"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p className={styles.requiredNote}>
        {copy?.requiredNote ?? "Mit * markierte Felder sind Pflichtfelder."}
      </p>
      <label className={styles.privacy} htmlFor="enquiry-privacy">
        <input
          id="enquiry-privacy"
          name="privacy"
          type="checkbox"
          required
          aria-invalid={!!state.errors?.privacy}
          aria-describedby={state.errors?.privacy ? "privacy-error" : undefined}
        />
        <span>
          Ich habe die{" "}
          {privacyContent ? (
            <button
              type="button"
              onClick={() => privacyDialog.current?.showModal()}
            >
              Datenschutzbestimmungen
            </button>
          ) : (
            <a
              href={privacyHref}
              target="_blank"
              rel="noopener"
              aria-label="Datenschutzbestimmungen in einem neuen Tab lesen"
            >
              Datenschutzbestimmungen
            </a>
          )}{" "}
          zur Kenntnis genommen und erkenne diese an.
        </span>
      </label>
      {privacyContent && (
        <dialog
          ref={privacyDialog}
          className={styles.privacyDialog}
          aria-label="Datenschutzbestimmungen"
        >
          <button
            type="button"
            autoFocus
            onClick={() => privacyDialog.current?.close()}
            aria-label="Schließen"
          >
            ×
          </button>
          {privacyContent}
        </dialog>
      )}
      {state.errors?.privacy && (
        <p id="privacy-error" className={styles.fieldError}>
          {state.errors.privacy}
        </p>
      )}
      <div className={styles.submitRow}>
        {!copy && (
          <span>
            Eine persönliche Anfrage.
            <br />
            Ein gemeinsamer Anfang.
          </span>
        )}
        <button
          className={shopwareLayout ? "button" : undefined}
          type="submit"
          disabled={pending}
        >
          {pending
            ? "Wird gesendet …"
            : (copy?.submitLabel ?? "Anfrage senden")}
        </button>
      </div>
    </form>
  );
}
