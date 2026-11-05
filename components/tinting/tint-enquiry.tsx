"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { submitTintEnquiry } from "@/app/toenung/actions";
import {
  tintEnquirySchema,
  type TintEnquiryState,
} from "@/lib/tinting/enquiry";
import type { TintMaterial } from "@/lib/tinting/model";
import styles from "./tinting.module.css";
const steps = ["Material", "Farbe", "Projekt", "Kontakt", "Prüfen"];
const stepFields = [
  ["material"],
  ["reference"],
  ["area", "quantity", "application", "date", "details"],
  [
    "salutation",
    "firstName",
    "lastName",
    "email",
    "phone",
    "company",
    "customerType",
    "message",
  ],
  ["privacy"],
];
export function TintEnquiry({
  materials,
  reference,
  materialId,
}: {
  materials: TintMaterial[];
  reference: string;
  materialId: string;
}) {
  const [state, action, pending] = useActionState(
      submitTintEnquiry,
      {} as TintEnquiryState,
    ),
    [step, setStep] = useState(0),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [review, setReview] = useState<Record<string, string>>({}),
    [colourRef, setColourRef] = useState(reference);
  const [draft, setDraft] = useState<Record<string, string>>({
    material: materials.find((m) => m.id === materialId)?.name || "",
    application: "Innenbereich",
    salutation: "8d43c89f7bed473ca0e5a2f25860f1ba",
    customerType: "Privatkunde",
  });
  const [privacy, setPrivacy] = useState(false);
  const change = (name: string, value: string) =>
    setDraft((current) => ({ ...current, [name]: value }));
  const form = useRef<HTMLFormElement>(null),
    notice = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const [previousReference, setPreviousReference] = useState(reference);
  const [previousResult, setPreviousResult] = useState(state);
  if (previousReference !== reference) {
    setPreviousReference(reference);
    if (reference) {
      setColourRef(reference);
      setDraft((current) => ({
        ...current,
        material:
          materials.find((m) => m.id === materialId)?.name || current.material,
      }));
      setStep(1);
    }
  }
  if (previousResult !== state) {
    setPreviousResult(state);
    if (state.error) {
      setErrors(state.errors || {});
      const first = Object.keys(state.errors || {})[0];
      const index = stepFields.findIndex((fields) => fields.includes(first));
      if (index >= 0) setStep(index);
    }
  }
  useEffect(() => {
    if (state.error || state.success) notice.current?.focus();
  }, [state]);
  function go(next: number) {
    const values = Object.fromEntries(new FormData(form.current!));
    if (next > step) {
      const result = tintEnquirySchema.safeParse(values);
      const relevant = result.success
        ? []
        : result.error.issues.filter((issue) =>
            stepFields[step].includes(String(issue.path[0])),
          );
      if (relevant.length) {
        setErrors(
          Object.fromEntries(
            relevant.map((i) => [String(i.path[0]), i.message]),
          ),
        );
        requestAnimationFrame(() => notice.current?.focus());
        return;
      }
    }
    setErrors({});
    setReview(
      Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, String(v)]),
      ),
    );
    setStep(next);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  }
  const field = (
    name: string,
    label: string,
    type = "text",
    required = false,
  ) => (
    <div className={styles.field}>
      <label htmlFor={`tint-field-${name}`}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={`tint-field-${name}`}
        name={name}
        required={required}
        value={draft[name] || ""}
        onChange={(e) => change(name, e.target.value)}
        type={type}
        maxLength={name === "email" ? 254 : 200}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `tint-error-${name}` : undefined}
        autoComplete={
          name === "firstName"
            ? "given-name"
            : name === "lastName"
              ? "family-name"
              : name === "email"
                ? "email"
                : name === "phone"
                  ? "tel"
                  : name === "company"
                    ? "organization"
                    : undefined
        }
      />
      {errors[name] && (
        <span id={`tint-error-${name}`} className={styles.error}>
          {errors[name]}
        </span>
      )}
    </div>
  );
  if (state.success)
    return (
      <div
        ref={notice}
        role="status"
        tabIndex={-1}
        className={styles.confirmation}
      >
        <p className={styles.label}>ANFRAGE ÜBERMITTELT</p>
        <h3>{state.success}</h3>
        <p>
          Unser Team prüft Ihre Angaben. Eine Tönung wird erst nach persönlicher
          Bestätigung vereinbart.
        </p>
        <Link className={styles.textLink} href="/produkte">
          Zur Kollektion
        </Link>
      </div>
    );
  return (
    <form
      ref={form}
      action={action}
      noValidate
      aria-busy={pending}
      className={styles.enquiry}
      onSubmit={(event) => {
        if (step !== 4) {
          event.preventDefault();
          go(Math.min(step + 1, 4));
          return;
        }
        const checked = tintEnquirySchema.safeParse(
          Object.fromEntries(new FormData(event.currentTarget)),
        );
        if (!checked.success) {
          event.preventDefault();
          setErrors(
            Object.fromEntries(
              checked.error.issues.map((i) => [String(i.path[0]), i.message]),
            ),
          );
          const invalidStep = stepFields.findIndex((fields) =>
            checked.error.issues.some((i) =>
              fields.includes(String(i.path[0])),
            ),
          );
          if (invalidStep >= 0) setStep(invalidStep);
          requestAnimationFrame(() => notice.current?.focus());
        }
      }}
    >
      <ol className={styles.stepper}>
        {steps.map((name, index) => (
          <li key={name} aria-current={index === step ? "step" : undefined}>
            <button
              type="button"
              disabled={index > step}
              onClick={() => go(index)}
            >
              <span>0{index + 1}</span>
              {name}
            </button>
          </li>
        ))}
      </ol>
      <h3 ref={heading} tabIndex={-1} className={styles.stepHeading}>
        {steps[step]}
      </h3>
      {(Object.keys(errors).length > 0 || state.error) && (
        <div ref={notice} role="alert" tabIndex={-1} className={styles.error}>
          <p>{state.error || "Bitte überprüfen Sie Ihre Angaben."}</p>
          <ul>
            {Object.entries(errors).map(([name, message]) => (
              <li key={name}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <fieldset hidden={step !== 0} className={styles.formSection}>
        <legend className={styles.srOnly}>Material wählen</legend>
        <label className={styles.field}>
          Viero Material
          <select
            name="material"
            value={draft.material}
            onChange={(e) => change("material", e.target.value)}
          >
            <option value="">Noch nicht sicher – bitte beraten Sie mich</option>
            {materials.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.small}>
          Die technische Eignung des Farbtons wird individuell geprüft.
        </p>
      </fieldset>
      <fieldset hidden={step !== 1} className={styles.formSection}>
        <legend className={styles.srOnly}>Farbreferenz</legend>
        <label className={styles.field}>
          Farbton, Code oder Kollektion *
          <textarea
            name="reference"
            value={colourRef}
            onChange={(e) => setColourRef(e.target.value)}
            maxLength={2500}
            rows={5}
            aria-invalid={!!errors.reference}
            placeholder="Zum Beispiel: Kollektion, Farbtonbezeichnung oder digitale HEX-Referenz"
          />
        </label>
        <p className={styles.small}>
          Ausgewählte Katalogfarben und digitale Referenzen können Sie hier
          ergänzen. Bilddateien werden nicht hochgeladen. Für Originalmuster und
          PDF-Unterlagen stimmen wir den sicheren Übermittlungsweg persönlich
          mit Ihnen ab.
        </p>
      </fieldset>
      <fieldset hidden={step !== 2} className={styles.formSection}>
        <legend className={styles.srOnly}>Projektdetails</legend>
        <div className={styles.formGrid}>
          {field("area", "Ungefähre Fläche in m²")}
          {field("quantity", "Benötigte Menge, falls bekannt")}
          <label className={styles.field}>
            Einsatzbereich
            <select
              name="application"
              value={draft.application}
              onChange={(e) => change("application", e.target.value)}
            >
              <option>Innenbereich</option>
              <option>Außenbereich</option>
              <option>Noch offen</option>
            </select>
          </label>
          {field("date", "Wunschtermin", "date")}
        </div>
        <label className={styles.field}>
          Weitere Projektinformationen
          <textarea
            name="details"
            rows={3}
            maxLength={3000}
            value={draft.details || ""}
            onChange={(e) => change("details", e.target.value)}
          />
        </label>
      </fieldset>
      <fieldset hidden={step !== 3} className={styles.formSection}>
        <legend className={styles.srOnly}>Kontaktdaten</legend>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            Anrede *
            <select
              name="salutation"
              value={draft.salutation}
              onChange={(e) => change("salutation", e.target.value)}
            >
              <option value="8d43c89f7bed473ca0e5a2f25860f1ba">
                Keine Angabe
              </option>
              <option value="12c6d3a5b1b2460c906e0a47fa7eb111">Frau</option>
              <option value="4cff4b10b4be4df582e0fbc990f3cb81">Herr</option>
            </select>
          </label>
          <label className={styles.field}>
            Ich plane als
            <select
              name="customerType"
              value={draft.customerType}
              onChange={(e) => change("customerType", e.target.value)}
            >
              <option>Privatkunde</option>
              <option>Handwerk</option>
              <option>Architektur / Planung</option>
              <option>Handel</option>
            </select>
          </label>
          {field("firstName", "Vorname", "text", true)}
          {field("lastName", "Nachname", "text", true)}
          {field("email", "E-Mail", "email", true)}
          {field("phone", "Telefon", "tel", true)}
          {field("company", "Firma")}
        </div>
        <p className={styles.small}>
          Das bestehende Formular des Tönungslabors benötigt eine Telefonnummer
          zur Rückfrage. Kontaktdaten werden nicht im Browser gespeichert.
        </p>
        <label className={styles.field}>
          Ihre Nachricht
          <textarea
            name="message"
            maxLength={3000}
            rows={3}
            value={draft.message || ""}
            onChange={(e) => change("message", e.target.value)}
          />
        </label>
      </fieldset>
      <fieldset hidden={step !== 4} className={styles.formSection}>
        <legend className={styles.srOnly}>Anfrage prüfen</legend>
        <dl className={styles.review}>
          <div>
            <dt>Material</dt>
            <dd>{review.material || "Beratung gewünscht"}</dd>
          </div>
          <div>
            <dt>Farbreferenz</dt>
            <dd>{review.reference}</dd>
          </div>
          <div>
            <dt>Projekt</dt>
            <dd>
              {review.application} ·{" "}
              {review.area ? `${review.area} m²` : "Fläche noch offen"}
              <br />
              {review.quantity} {review.date}
              <br />
              {review.details}
            </dd>
          </div>
          <div>
            <dt>Kontakt</dt>
            <dd>
              {review.firstName} {review.lastName}
              <br />
              {review.company}
              <br />
              {review.email}
              <br />
              {review.phone}
              <br />
              {review.customerType}
            </dd>
          </div>
          {review.message && (
            <div>
              <dt>Nachricht</dt>
              <dd>{review.message}</dd>
            </div>
          )}
        </dl>
        <label className={styles.consent}>
          <input
            name="privacy"
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            aria-invalid={!!errors.privacy}
          />
          <span>
            Ich habe die{" "}
            <a
              href="https://viero-deutschland.de/widgets/cms/01916b602603738ea01c74d7c10fe3a5"
              target="_blank"
              rel="noopener"
            >
              Datenschutzbestimmungen
            </a>{" "}
            zur Kenntnis genommen. Meine Angaben dürfen zur Bearbeitung dieser
            Anfrage verwendet werden.
          </span>
        </label>
        <p className={styles.small}>
          Unverbindlich. Ihre Anfrage ist keine Bestellung und keine Bestätigung
          einer Tönungsrezeptur.
        </p>
      </fieldset>
      <label className={styles.honeypot} aria-hidden="true">
        Dieses Feld leer lassen
        <input name="honeypot" tabIndex={-1} autoComplete="off" />
      </label>
      <div className={styles.formNavigation}>
        {step > 0 && (
          <button
            type="button"
            className={styles.secondary}
            disabled={pending}
            onClick={() => go(step - 1)}
          >
            Zurück
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            className={styles.primary}
            key="advance"
            onClick={() => go(step + 1)}
          >
            Weiter <span aria-hidden="true">＋</span>
          </button>
        ) : (
          <button
            key="submit"
            className={styles.primary}
            type="submit"
            disabled={pending}
          >
            {pending
              ? "Wird übermittelt …"
              : "Unverbindliche Tönungsanfrage senden"}
          </button>
        )}
      </div>
    </form>
  );
}
