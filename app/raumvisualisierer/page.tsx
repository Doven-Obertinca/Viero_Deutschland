import { metadata as pageMetadata } from "@/lib/seo";
import { getVisualizerMaterials } from "@/lib/visualizer/catalog";
import { visualizerPath } from "@/lib/visualizer/model";
import { Studio } from "./studio";

export const metadata = pageMetadata(
  "Raumvisualisierer | Dekorative Wandgestaltung online testen",
  visualizerPath,
  "Entdecken Sie VIERO Wandoberflächen direkt in Ihren Räumen. Foto hochladen, dekorative Oberflächen auswählen und Wandgestaltung online visualisieren.",
);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ produkt?: string | string[] }>;
}) {
  const catalog = getVisualizerMaterials().catch(() => null);
  const { produkt } = await searchParams;
  return (
    <Studio
      catalogRequest={catalog}
      preselected={typeof produkt === "string" ? produkt : undefined}
    />
  );
}
