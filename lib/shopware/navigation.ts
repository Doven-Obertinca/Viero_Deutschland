import { cache } from "react";
import { z } from "zod";
import { storeRequest } from "./client";
import { categorySchema } from "./types";
import { getContext } from "./context";
export const getNavigation = cache(async () => {
  const context = await getContext();
  const root = context.salesChannel.navigationCategoryId;
  return storeRequest(`/navigation/${root}/${root}`, z.array(categorySchema), {
    body: { depth: 2, buildTree: true },
    contextToken: context.token,
  });
});
