import "server-only";
export function shopwareConfig() {
  const url = process.env.SHOPWARE_STORE_API_URL;
  const key = process.env.SHOPWARE_STORE_API_ACCESS_KEY;
  if (!url || !key) throw new Error("CONFIGURATION");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost")
    throw new Error("CONFIGURATION");
  return { url: url.replace(/\/$/, ""), key };
}
