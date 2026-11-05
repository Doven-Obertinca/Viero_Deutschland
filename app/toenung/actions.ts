"use server";
import {
  tintEnquirySchema,
  formatTintEnquiry,
  nativeTintFormId,
  nativeTintPage,
  type TintEnquiryState,
} from "@/lib/tinting/enquiry";
import { deliverEnquiry } from "@/lib/shopware/showroom-enquiry";
export async function submitTintEnquiry(
  _state: TintEnquiryState,
  form: FormData,
): Promise<TintEnquiryState> {
  for (const value of form.values())
    if (typeof value !== "string")
      return {
        error:
          "Dateianhänge werden vom bestehenden Tönungsformular nicht unterstützt. Bitte nur eine Farbreferenz senden.",
      };
  const parsed = tintEnquirySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      error: "Bitte überprüfen Sie Ihre Angaben.",
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ),
    };
  const v = parsed.data;
  try {
    const page = await fetch(nativeTintPage, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!page.ok || !(await page.text()).includes(`form-${nativeTintFormId}`))
      return {
        error:
          "Das Tönungsformular ist derzeit nicht erreichbar. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es später erneut.",
      };
    const values: Record<string, string> = {
      Anrede: v.salutation,
      VornameAnsprechpartner: v.firstName,
      NachnameAnsprechpartner: v.lastName,
      "E-Mail": v.email,
      Telefon: v.phone,
      Betreff: `Tönungsanfrage – ${v.material || "Materialberatung"}`,
      Nachricht: formatTintEnquiry(v),
    };
    const result = await deliverEnquiry(
      {
        id: nativeTintFormId,
        title: "Farbtonanfrage",
        successMessage: "Ihre Tönungsanfrage wurde übermittelt.",
        fields: Object.keys(values).map((name) => ({
          name,
          type: "text",
          label: name,
          placeholder: "",
          required: true,
          width: 12,
          options: [],
        })),
      },
      values,
      nativeTintPage,
    );
    return result.success
      ? { success: result.success }
      : {
          error:
            result.error || "Die Übermittlung konnte nicht bestätigt werden.",
        };
  } catch {
    return {
      error:
        "Die Übermittlung konnte nicht bestätigt werden. Bitte senden Sie die Anfrage nicht mehrfach.",
    };
  }
}
