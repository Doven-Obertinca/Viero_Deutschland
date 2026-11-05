import { z } from "zod";
export const tintEnquirySchema = z.object({
  material: z.string().max(120),
  reference: z
    .string()
    .trim()
    .min(1, "Bitte eine Farbreferenz angeben.")
    .max(2500),
  area: z
    .string()
    .max(20)
    .refine(
      (v) =>
        !v ||
        (/^\d{1,7}([.,]\d{1,2})?$/.test(v) && Number(v.replace(",", ".")) > 0),
      "Bitte eine positive Fläche eingeben.",
    ),
  quantity: z.string().max(80),
  application: z.enum(["Innenbereich", "Außenbereich", "Noch offen"]),
  date: z
    .string()
    .max(10)
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Bitte ein gültiges Datum wählen.",
    ),
  details: z.string().max(3000),
  salutation: z.enum([
    "12c6d3a5b1b2460c906e0a47fa7eb111",
    "4cff4b10b4be4df582e0fbc990f3cb81",
    "8d43c89f7bed473ca0e5a2f25860f1ba",
  ]),
  firstName: z.string().trim().min(1, "Bitte Vornamen angeben.").max(120),
  lastName: z.string().trim().min(1, "Bitte Nachnamen angeben.").max(120),
  email: z.email("Bitte eine gültige E-Mail-Adresse angeben.").max(254),
  phone: z
    .string()
    .trim()
    .min(1, "Bitte Telefonnummer angeben (Pflichtfeld des Tönungslabors).")
    .max(80),
  company: z.string().max(200),
  customerType: z.enum([
    "Privatkunde",
    "Handwerk",
    "Architektur / Planung",
    "Handel",
  ]),
  message: z.string().max(3000),
  privacy: z.literal("on", {
    error: "Bitte die Datenschutzhinweise bestätigen.",
  }),
  honeypot: z.literal(""),
});
export type TintEnquiry = z.infer<typeof tintEnquirySchema>;
export type TintEnquiryState = {
  error?: string;
  errors?: Record<string, string>;
  success?: string;
};
export function formatTintEnquiry(v: TintEnquiry) {
  return [
    "UNVERBINDLICHE TÖNUNGSANFRAGE",
    `Material: ${v.material || "Noch nicht sicher"}`,
    `Farbreferenz: ${v.reference}`,
    `Fläche: ${v.area ? `${v.area} m²` : "Noch offen"}`,
    `Menge: ${v.quantity || "Noch offen"}`,
    `Einsatz: ${v.application}`,
    `Wunschtermin: ${v.date || "Noch offen"}`,
    `Projektdetails: ${v.details || "–"}`,
    `Firma: ${v.company || "–"}`,
    `Kundentyp: ${v.customerType}`,
    `Nachricht: ${v.message || "–"}`,
    "Digitale Referenzen sind keine bestätigten Rezepturen. Bitte technische Machbarkeit und Systemaufbau prüfen.",
  ].join("\n\n");
}
export const nativeTintFormId = "01916a079e4b7378932f08feeba2ba8c";
export const nativeTintPage = "https://viero-deutschland.de/Toenung/";
