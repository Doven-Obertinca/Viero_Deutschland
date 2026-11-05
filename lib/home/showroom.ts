import "server-only";
import { cache } from "react";
import { storeRequest } from "../shopware/client";
import { shopwareConfig } from "../shopware/config";
import { parseShowroom, showroomCategorySchema } from "./showroom-content";

// A content reference, not duplicated business data. All displayed values are
// read from the category, its assigned CMS page and resolved media each request.
export const showroomCategoryId = "019529e557527a44b6b89df9dc88f2f0";
export const getShowroomCategory = cache(async () => {
  try {
    const id = process.env.SHOPWARE_SHOWROOM_CATEGORY_ID || showroomCategoryId;
    if (!/^[a-f\d]{32}$/i.test(id)) return null;
    const category = await storeRequest(
      `/category/${id}`,
      showroomCategorySchema,
      {
        body: {
          associations: {
            media: { associations: { thumbnails: {} } },
            seoUrls: {},
          },
        },
      },
    );
    return category;
  } catch {
    // Backend downtime must not take the approved homepage chapters down with it.
    return null;
  }
});

export const getShowroom = cache(async () => {
  const category = await getShowroomCategory();
  return category
    ? parseShowroom(category, new URL(shopwareConfig().url).origin)
    : null;
});
