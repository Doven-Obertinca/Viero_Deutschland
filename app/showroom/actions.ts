"use server";
import { getShowroomForm } from "@/lib/home/showroom-form";
import { getShowroom } from "@/lib/home/showroom";
import {
  deliverEnquiry,
  validateEnquiry,
  type EnquiryState,
} from "@/lib/shopware/showroom-enquiry";
export async function submitShowroom(
  _state: EnquiryState,
  data: FormData,
): Promise<EnquiryState> {
  const [definition, showroom] = await Promise.all([
    getShowroomForm(),
    getShowroom(),
  ]);
  if (!definition || !showroom?.pageUrl)
    return {
      error:
        "Das Kontaktformular ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.",
    };
  const validated = validateEnquiry(definition, data);
  if (validated.error) return validated;
  return deliverEnquiry(definition, validated.values || {}, showroom.pageUrl);
}
