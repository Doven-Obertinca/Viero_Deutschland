import "server-only";
import { cache } from "react";
import { storeRequest } from "../shopware/client";
import { showroomCategorySchema } from "../home/showroom-content";
import { getFooterContent } from "./footer";
export const getFooterDocument = cache(async (id: string) => {
  if (!/^[a-f\d]{32}$/i.test(id)) return null;
  const footer = await getFooterContent();
  const link = footer.groups
    .flatMap((g) => g.links)
    .find((link) => link.id === id && link.href.startsWith("/informationen/"));
  if (!link) return null;
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
  ).catch(() => null);
  if (!category || category.active === false) return null;
  const html =
    category.cmsPage?.sections
      ?.flatMap(
        (section) =>
          section.blocks?.flatMap((block) =>
            block.slots
              ?.filter((slot) => slot.type === "text")
              .map((slot) =>
                typeof slot.data?.content === "string" ? slot.data.content : "",
              ),
          ) || [],
      )
      .filter(Boolean)
      .join("\n") || "";
  return { category, html, title: link.title, footer };
});
