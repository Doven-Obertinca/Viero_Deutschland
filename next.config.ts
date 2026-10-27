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
    remotePatterns: [...hosts].map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
  poweredByHeader: false,
};
export default config;
