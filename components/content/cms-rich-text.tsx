import { createElement, type ReactNode } from "react";
import { parseRichText, type TextNode } from "@/lib/content/rich-text";
import type { FooterLink } from "@/lib/content/footer-model";
export function CmsRichText({
  html,
  origin,
  links,
}: {
  html: string;
  origin: string;
  links: FooterLink[];
}) {
  function resolve(href: string) {
    if (href.startsWith("#")) return /^#[\w-]+$/.test(href) ? href : undefined;
    if (
      /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(href) ||
      /^tel:\+?[\d\s().-]+$/i.test(href)
    )
      return href;
    try {
      const u = new URL(href, origin);
      if (!["https:", "http:"].includes(u.protocol) || u.username || u.password)
        return undefined;
      if (u.origin === origin) {
        const path = u.pathname.replace(/^\/+|\/+$/g, "");
        const target = links.find(
          (link) =>
            path === link.sourcePath?.replace(/^\/+|\/+$/g, "") ||
            u.pathname === `/widgets/cms/${link.cmsPageId}`,
        );
        if (target) return target.href + u.hash;
      }
      return u.href;
    } catch {
      return undefined;
    }
  }
  function render(node: TextNode, index: number): ReactNode {
    if (node.tag === "text" && "text" in node) return node.text;
    if (!("children" in node)) return null;
    const tag = node.tag === "h1" ? "h2" : node.tag;
    if (tag === "a" && !node.href)
      return <span key={index}>{node.children.map(render)}</span>;
    return createElement(
      tag,
      {
        key: index,
        ...(node.id ? { id: node.id } : {}),
        ...(node.href ? { href: node.href } : {}),
      },
      ...node.children.map(render),
    );
  }
  return <>{parseRichText(html, resolve).map(render)}</>;
}
