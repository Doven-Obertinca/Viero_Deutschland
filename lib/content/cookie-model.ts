import { cmsText } from "../home/showroom-content";
export type ConsentEntry = {
  name: string;
  label: string;
  required: boolean;
  value: string;
  days: number;
  description: string;
};
export type ConsentGroup = {
  id: string;
  title: string;
  description: string;
  required: boolean;
  entries: ConsentEntry[];
};
export type ConsentConfig = {
  description: string;
  groups: ConsentGroup[];
  available: boolean;
  version: string;
};
function attr(input: string, name: string) {
  const m = input.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return m ? cmsText(m[1] ?? m[2]) : undefined;
}
export function parseCookieMarkup(html: string): {
  description: string;
  groups: ConsentGroup[];
} {
  const description = cmsText(
    html.match(
      /class="offcanvas-cookie-description"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/i,
    )?.[1] || "",
  )
    .replace(/Mehr Informationen\s*\.{0,3}/, "")
    .trim();
  const groups = html
    .split(/<div\s+class="offcanvas-cookie-group"\s*>/i)
    .slice(1)
    .map((block, index) => {
      const parent =
        block.match(/<input\b[^>]*offcanvas-cookie-parent-input[^>]*>/i)?.[0] ||
        "";
      const parentId = attr(parent, "id") || "";
      const escaped = parentId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const title = cmsText(
        block.match(
          new RegExp(
            `<label\\s+for="${escaped}"[^>]*>([\\s\\S]*?)<\\/label>`,
            "i",
          ),
        )?.[1] || "",
      );
      const required = attr(parent, "data-cookie-required") === "true";
      const entries = block
        .split(/<div\s+class="offcanvas-cookie-entry\s+form-check"\s*>/i)
        .slice(1)
        .flatMap((entry) => {
          const input = entry.match(/<input\b[^>]*>/i)?.[0] || "";
          const name = attr(input, "data-cookie");
          if (!name || !/^[-\w.]+$/.test(name)) return [];
          const label = cmsText(
            entry.match(/<label\b[^>]*>([\s\S]*?)<\/label>/i)?.[1] || name,
          );
          const days = Number(attr(input, "data-cookie-expiration") || 30);
          return [
            {
              name,
              label,
              required:
                required || attr(input, "data-cookie-required") === "true",
              value: attr(input, "data-cookie-value") || "1",
              days: days > 0 && days <= 365 ? days : 30,
              description: cmsText(
                entry.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "",
              ),
            },
          ];
        });
      const beforeEntries = block.split(
        /<div\s+class="offcanvas-cookie-entry\s+form-check"/i,
      )[0];
      const desc =
        beforeEntries.match(
          /class="offcanvas-cookie-entries collapse"[^>]*>([\s\S]*)/i,
        )?.[1] || "";
      return {
        id: `group-${index}`,
        title,
        required,
        description: cmsText(desc),
        entries,
      };
    })
    .filter((g) => g.title && g.entries.length);
  return { description, groups };
}
export type ConsentChoices = Record<string, boolean>;
export function allChoices(
  groups: ConsentGroup[],
  enabled: boolean,
): ConsentChoices {
  return Object.fromEntries(
    groups.flatMap((g) =>
      g.entries.map((e) => [e.name, e.required || enabled]),
    ),
  );
}
export function normalizeChoices(
  groups: ConsentGroup[],
  input: unknown,
): ConsentChoices {
  const values =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    groups.flatMap((g) =>
      g.entries.map((e) => [e.name, e.required || values[e.name] === true]),
    ),
  );
}
