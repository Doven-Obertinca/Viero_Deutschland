"use server";

import { getAcademy } from "@/lib/content/academy";
import {
  deliverEnquiry,
  validateEnquiry,
  type EnquiryState,
} from "@/lib/shopware/showroom-enquiry";

export async function submitAcademy(
  _state: EnquiryState,
  data: FormData,
): Promise<EnquiryState> {
  const academy = await getAcademy();
  if (!academy?.form)
    return { error: "Das Anfrageformular ist derzeit nicht verfügbar." };
  const validation = validateEnquiry(academy.form, data);
  if (validation.error) return validation;
  return deliverEnquiry(academy.form, validation.values ?? {}, academy.source);
}
