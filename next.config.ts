import {
  contactCategoryId,
  contactFooterCategoryId,
  contactPath,
  inspirationCategoryId,
  inspirationPath,
} from "./lib/content/contact-route";
import { academyCategoryId, academyPath } from "./lib/content/academy-route";
import {
  aboutCategoryId,
  aboutFooterCategoryId,
  aboutPath,
} from "./lib/content/about-route";
import type { NextConfig } from "next";
const hosts = new Set([
  "viero-deutschland.de",
  ...(process.env.SHOPWARE_MEDIA_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean),
]);
if (process.env.SHOPWARE_STORE_API_URL)
  hosts.add(new URL(process.env.SHOPWARE_STORE_API_URL).hostname);
const config: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [...hosts].map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
  redirects() {
    return [
      `/kategorie/${aboutCategoryId}`,
      `/kategorie/${aboutFooterCategoryId}`,
      `/informationen/${aboutFooterCategoryId}`,
    ]
      .map((source) => ({ source, destination: aboutPath, permanent: true }))
      .concat(
        {
          source: `/kategorie/${academyCategoryId}`,
          destination: academyPath,
          permanent: true,
        },
        ...[
          `/kategorie/${contactCategoryId}`,
          `/kategorie/${contactFooterCategoryId}`,
          `/informationen/${contactFooterCategoryId}`,
        ].map((source) => ({
          source,
          destination: contactPath,
          permanent: true,
        })),
        ...["/Inspiration", `/kategorie/${inspirationCategoryId}`].map(
          (source) => ({
            source,
            destination: inspirationPath,
            permanent: true,
          }),
        ),
      );
  },
  poweredByHeader: false,
};
export default config;
