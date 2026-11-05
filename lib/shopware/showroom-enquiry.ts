import "server-only";
import { shopwareConfig } from "./config";
import { cmsText } from "../home/showroom-content";
import type { ShowroomFormDefinition } from "../home/showroom-form";

export type EnquiryState = {
  success?: string;
  error?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};
export function validateEnquiry(
  definition: ShowroomFormDefinition,
  form: FormData,
): EnquiryState {
  const errors: Record<string, string> = {};
  const values: Record<string, string> = {};
  for (const field of definition.fields) {
    const raw = form.get(field.name);
    const value = typeof raw === "string" ? raw.trim() : "";
    values[field.name] = value;
    if (field.required && !value)
      errors[field.name] = `Bitte ${field.label} ausfüllen.`;
    else if (value.length > 10000)
      errors[field.name] = "Bitte kürzen Sie diese Eingabe.";
    else if (
      field.type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    )
      errors[field.name] = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    else if (
      field.type === "select" &&
      value &&
      !field.options.some(([key]) => key === value)
    )
      errors[field.name] = "Bitte wählen Sie eine gültige Option.";
  }
  if (form.get("privacy") !== "on")
    errors.privacy = "Bitte bestätigen Sie die Datenschutzbestimmungen.";
  if (form.get("shopware_surname_confirm"))
    errors.form = "Die Anfrage konnte nicht verarbeitet werden.";
  return Object.keys(errors).length
    ? { error: "Bitte überprüfen Sie Ihre Angaben.", errors, values }
    : { values };
}

// Reuse the original anonymous Shopware custom-form flow. Cookies stay server-side;
// only validated fields and the CMS form ID are forwarded, never customer sessions.
export async function deliverEnquiry(
  definition: ShowroomFormDefinition,
  values: Record<string, string>,
  pageUrl: string,
): Promise<EnquiryState> {
  const origin = new URL(shopwareConfig().url).origin;
  if (new URL(pageUrl).origin !== origin)
    return { error: "Die Anfrage ist derzeit nicht verfügbar.", values };
  const cookies = new Map<string, string>();
  function remember(response: Response) {
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0];
      const index = pair.indexOf("=");
      if (index > 0) cookies.set(pair.slice(0, index), pair.slice(index + 1));
    }
  }
  const headers = () => ({
    Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join(";"),
    Referer: pageUrl,
  });
  try {
    const session = await fetch(pageUrl, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    if (!session.ok)
      return {
        error:
          "Die Anfrage ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.",
        values,
      };
    remember(session);
    const body = new FormData();
    for (const field of definition.fields)
      body.set(field.name, values[field.name] || "");
    body.set("formId", `form-${definition.id}`);
    body.set("privacy", "on");
    body.set("shopware_surname_confirm", "");
    let response = await fetch(`${origin}/swag/cms-extensions/form`, {
      method: "POST",
      headers: headers(),
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    remember(response);
    for (
      let i = 0;
      i < 3 && response.status >= 300 && response.status < 400;
      i++
    ) {
      const location = response.headers.get("location");
      if (!location) break;
      const destination = new URL(location, origin);
      if (destination.origin !== origin) throw new Error("Unexpected redirect");
      response = await fetch(destination, {
        headers: headers(),
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
      });
      remember(response);
    }
    const html = await response.text();
    const success = /<[^>]+class=["'][^"']*alert-success\b/i.test(html);
    const failure = /<[^>]+class=["'][^"']*alert-(?:danger|warning)\b/i.test(
      html,
    );
    if (response.ok && success && !failure)
      return { success: definition.successMessage };
    const json = (() => {
      try {
        return JSON.parse(html);
      } catch {
        return null;
      }
    })();
    if (response.ok && json?.success === true)
      return { success: definition.successMessage };
    const message = html.match(
      /<[^>]+class=["'][^"']*alert-(?:danger|warning)\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    )?.[1];
    return {
      error: message
        ? cmsText(message).slice(0, 400)
        : "Die Übermittlung konnte nicht bestätigt werden. Bitte kontaktieren Sie uns, bevor Sie die Anfrage erneut senden.",
      values,
    };
  } catch {
    return {
      error:
        "Die Verbindung wurde unterbrochen. Die Übermittlung konnte nicht bestätigt werden. Bitte senden Sie die Anfrage nicht mehrfach.",
      values,
    };
  }
}
