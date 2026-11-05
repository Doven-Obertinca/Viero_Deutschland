import "server-only";
import { cache } from "react";
import { parseCmsForm } from "../home/showroom-form";
import { showroomCategorySchema } from "../home/showroom-content";
import { storeRequest } from "../shopware/client";
import { contactCategoryId } from "./contact-route";

export const getContactForm = cache(async () => {
  const category = await storeRequest(
    `/category/${contactCategoryId}`,
    showroomCategorySchema,
  ).catch(() => null);
  return category?.active === false ? null : parseCmsForm(category);
});
