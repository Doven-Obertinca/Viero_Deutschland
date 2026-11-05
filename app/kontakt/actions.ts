"use server";

import { getContactForm } from "@/lib/content/contact";
import { contactSourcePath } from "@/lib/content/contact-route";
import { shopwareConfig } from "@/lib/shopware/config";
import {
  deliverEnquiry,
  validateEnquiry,
  type EnquiryState,
} from "@/lib/shopware/showroom-enquiry";

export async function submitContact(
  _state: EnquiryState,
  data: FormData,
): Promise<EnquiryState> {
  const form = await getContactForm();
  if (!form)
    return { error: "Das Kontaktformular ist derzeit nicht verfügbar." };
  const validation = validateEnquiry(form, data);
  if (validation.error) return validation;
  return deliverEnquiry(
    form,
    validation.values ?? {},
    new URL(contactSourcePath, shopwareConfig().url).href,
  );
}
