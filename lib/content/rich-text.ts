import { cmsText } from "../home/showroom-content";
export type TextNode =
  | { tag: "text"; text: string }
  | { tag: string; children: TextNode[]; href?: string; id?: string };
const allowed = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "small",
  "blockquote",
  "address",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "br",
  "hr",
  "a",
]);
export function parseRichText(
  html: string,
  resolveLink: (value: string) => string | undefined,
): TextNode[] {
  const root: { tag: string; children: TextNode[] } = {
    tag: "root",
    children: [],
  };
  const stack = [root];
  const clean = html
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<(script|style|iframe|object|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  for (const token of clean.match(/<(?:"[^"]*"|'[^']*'|[^'">])*>|[^<]+/g) ||
    []) {
    if (token.startsWith("<")) {
      const tag = token.match(/^<\/?([a-z\d]+)/i)?.[1]?.toLowerCase();
      if (!tag || !allowed.has(tag)) continue;
      if (token.startsWith("</")) {
        const index = stack.map((n) => n.tag).lastIndexOf(tag);
        if (index > 0) stack.length = index;
        continue;
      }
      const attr = (name: string) => {
        const m = token.match(
          new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
        );
        return m ? cmsText(m[1] ?? m[2]) : undefined;
      };
      const node: {
        tag: string;
        children: TextNode[];
        href?: string;
        id?: string;
      } = { tag, children: [] };
      const id = attr("id");
      if (id && /^[\w-]+$/.test(id)) node.id = id;
      const href = attr("href");
      if (tag === "a" && href) node.href = resolveLink(href);
      stack[stack.length - 1].children.push(node);
      if (!["br", "hr"].includes(tag)) stack.push(node);
    } else {
      const text = cmsText(token);
      if (text)
        stack[stack.length - 1].children.push({
          tag: "text",
          text:
            (/^\s/.test(token) ? " " : "") +
            text +
            (/\s$/.test(token) ? " " : ""),
        });
    }
  }
  return root.children;
}
