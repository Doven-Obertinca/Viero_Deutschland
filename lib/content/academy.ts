import "server-only";
import { cache } from "react";
import { showroomCategorySchema, cmsText } from "../home/showroom-content";
import { parseCmsForm } from "../home/showroom-form";
import { storeRequest } from "../shopware/client";
import { shopwareConfig } from "../shopware/config";
import { academyCategoryId, academySourcePath } from "./academy-route";

export const getAcademy = cache(async () => {
  const category = await storeRequest(
    `/category/${academyCategoryId}`,
    showroomCategorySchema,
  ).catch(() => null);
  if (!category || category.active === false) return null;

  const origin = new URL(shopwareConfig().url).origin;
  const sections = new Map(
    category.cmsPage?.sections?.map((section) => [
      section.position,
      (section.blocks ?? [])
        .flatMap((block) => block.slots ?? [])
        .flatMap((slot) =>
          slot.type === "text" && typeof slot.data?.content === "string"
            ? [slot.data.content]
            : [],
        )
        .join("\n"),
    ]),
  );
  const heroLines = (sections.get(0) ?? "")
    .split(/<br\s*\/?\s*>/i)
    .map(cmsText);
  const title =
    heroLines
      .find((line) => /^Headline:/i.test(line))
      ?.slice(9)
      .trim() ||
    category.translated?.name ||
    category.name ||
    "Akademie";
  const videoPath = heroLines
    .find((line) => /^Video:/i.test(line))
    ?.slice(6)
    .trim();
  const video = videoPath ? URL.parse(videoPath, origin) : null;
  const [offerHeading, ...offers] = (sections.get(3) ?? "").split(
    /<div\b[^>]*class=["']cms-akademie-listing["'][^>]*>/i,
  );

  return {
    title,
    origin,
    source: new URL(academySourcePath, origin).href,
    video:
      video?.origin === origin && /\.mp4$/i.test(video.pathname)
        ? video.href
        : undefined,
    intro: sections.get(1),
    offerHeading: offerHeading?.replace(
      /<div\s+id=["']seminare["']\s*><\/div>/i,
      "",
    ),
    offers,
    syllabus: sections.get(4),
    form: parseCmsForm(category),
  };
});
