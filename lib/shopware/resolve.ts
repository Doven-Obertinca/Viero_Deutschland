import { z } from "zod";
import { storeRequest } from "./client";
import { isShopwareId } from "./urls";
export async function resolveProductId(slug: string[]) {
  if (slug.length === 1 && isShopwareId(slug[0])) return slug[0];
  const result = await storeRequest(
    "/seo-url",
    z.object({ elements: z.array(z.object({ foreignKey: z.string() })) }),
    {
      body: {
        limit: 1,
        filter: [
          { type: "equals", field: "seoPathInfo", value: slug.join("/") },
          { type: "equals", field: "routeName", value: "frontend.detail.page" },
        ],
      },
    },
  );
  return result.elements[0]?.foreignKey;
}
