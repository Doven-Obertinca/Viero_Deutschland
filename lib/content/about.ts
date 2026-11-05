import "server-only";
import { cache } from "react";
import { cmsText, showroomCategorySchema } from "../home/showroom-content";
import { storeRequest } from "../shopware/client";
import { aboutCategoryId } from "./about-route";

// Shopware authors the profiles and chronology as rich-text blocks.
function splitHeadings(html: string) {
  const parts = html.split(/<h3\b[^>]*>([\s\S]*?)<\/h3\s*>/gi);
  return {
    intro: parts[0],
    entries: parts
      .slice(1)
      .flatMap((part, index) =>
        index % 2 === 0
          ? [{ title: cmsText(part), html: parts[index + 2] }]
          : [],
      ),
  };
}

export const getAbout = cache(async () => {
  const category = await storeRequest(
    `/category/${aboutCategoryId}`,
    showroomCategorySchema,
  ).catch(() => null);
  if (!category || category.active === false) return null;

  const blocks = (category.cmsPage?.sections ?? []).flatMap((section) =>
    (section.blocks ?? []).flatMap((block) =>
      (block.slots ?? []).flatMap((slot) => {
        const content = slot.data?.content;
        return slot.type === "text" &&
          typeof content === "string" &&
          !/^\s*Headline:\s*category\.name\b/i.test(content)
          ? [content]
          : [];
      }),
    ),
  );
  const title = category.translated?.name || category.name;
  if (!title || !blocks.length) return null;

  return {
    title,
    chapters: blocks.map((html) => {
      const history = /<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/i.exec(html);
      if (history) {
        const { intro, entries } = splitHeadings(html.replace(history[0], ""));
        if (entries.length)
          return {
            type: "timeline" as const,
            title: cmsText(history[1]),
            intro,
            entries,
          };
      }
      return { type: "profile" as const, ...splitHeadings(html) };
    }),
  };
});
