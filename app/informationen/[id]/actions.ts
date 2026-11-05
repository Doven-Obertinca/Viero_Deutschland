"use server";
import { getFooterDocument } from "@/lib/content/document";
import { parseCmsForm } from "@/lib/home/showroom-form";
import {
  deliverEnquiry,
  validateEnquiry,
  type EnquiryState,
} from "@/lib/shopware/showroom-enquiry";
export async function submitInformation(
  id: string,
  _state: EnquiryState,
  data: FormData,
): Promise<EnquiryState> {
  const document = await getFooterDocument(id);
  if (!document)
    return { error: "Das Kontaktformular ist derzeit nicht verfügbar." };
  const definition = parseCmsForm(document.category);
  const path = document.category.seoUrls?.find(
    (s) => s.isCanonical && !s.isDeleted,
  )?.seoPathInfo;
  if (!definition || !path)
    return { error: "Das Kontaktformular ist derzeit nicht verfügbar." };
  const validation = validateEnquiry(definition, data);
  if (validation.error) return validation;
  const source = new URL(`/${path.replace(/^\/+/, "")}`, document.footer.origin)
    .href;
  return deliverEnquiry(definition, validation.values || {}, source);
}
