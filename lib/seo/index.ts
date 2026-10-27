import type { Metadata } from "next";
export const siteUrl = () =>
  new URL(process.env.SITE_URL || "http://localhost:3000");
export function metadata(
  title: string,
  path: string,
  description?: string | null,
): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    openGraph: {
      title,
      url: path,
      locale: "de_DE",
      type: "website",
      ...(description ? { description } : {}),
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export function plainText(value?: string | null) {
  return value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
