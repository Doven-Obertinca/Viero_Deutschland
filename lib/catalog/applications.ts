import type { Product } from "../shopware/types";
import { productName } from "../shopware/urls";

// Reviewed manufacturer guidance, 2026-11-04. Exact family names only: never
// classify a primer, sample or tool from a keyword in its marketing description.
const mineralWalls = new Set([
  "marmorin",
  "marmorin extra",
  "marmorin hydro",
  "marmorin sand",
  "marmorin satin",
  "mithos lux",
  "travertine",
  "vixalit 500",
  "vxf",
]);
const decorativeWalls = new Set([
  "allure",
  "erametal",
  "ghibli",
  "krakkle",
  "lithos",
  "rusten finish",
  "silk",
  "viero vel",
  "vieroplast",
]);
export const applicationSources = {
  mineral: "https://www.vierodecoratives.com/de/mineralische-finishs-produkte/",
  decorative: "https://www.vierodecoratives.com/de/complementaries/",
  extra: "https://www.vierodecoratives.com/de/effekte/marmorino-extra/",
  satin: "https://www.vierodecoratives.com/de/produkte/marmorin-satin/",
  hydro:
    "https://docuproxy.cromology.it/ST/DE_VID455165T%20Marmorin%20Hydro.pdf",
  ghibli: "https://docuproxy.cromology.it/ST/EN_VID455154T%20Ghibli.pdf",
  oltre:
    "https://www.vierodecoratives.com/oltre-seamless-decorative-wall-and-floor-system/",
};
export function applicationFacets(product: Product): Record<string, string[]> {
  const name = productName(product).trim().toLocaleLowerCase("de");
  const facets: Record<string, string[]> = {};
  if (mineralWalls.has(name) || decorativeWalls.has(name))
    facets["Fläche"] = ["Wand"];
  // Room suggestions for ordinary dry living spaces follow verified interior use.
  if (["marmorin extra", "marmorin hydro", "ghibli"].includes(name)) {
    facets["Einsatzbereich"] = ["Innenbereich"];
    facets["Zimmer"] = ["Wohnzimmer", "Schlafzimmer", "Flur"];
  }
  if (name === "marmorin extra") {
    facets["Einsatzbereich"] = ["Innenbereich", "Außenbereich"];
    facets["Fläche"] = ["Wand", "Fassade"];
  }
  if (name === "marmorin satin") {
    facets["Einsatzbereich"] = ["Außenbereich"];
    facets["Fläche"] = ["Wand", "Fassade"];
  }
  if (name === "marmorin hydro") facets["Zimmer"].push("Badezimmer");
  // Oltre components belong to a complete wall/floor system, rather than each
  // component being a standalone waterproof finish.
  if (
    [
      "oltre",
      "oltre base",
      "oltre barrier",
      "oltre style",
      "oltre top 2k",
    ].includes(name)
  ) {
    facets["Einsatzbereich"] = ["Innenbereich"];
    facets["Fläche"] = ["Wand", "Boden", "Treppe"];
    facets["Zimmer"] = ["Wohnzimmer", "Küche", "Badezimmer"];
  }
  return facets;
}
