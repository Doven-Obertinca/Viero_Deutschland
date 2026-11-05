import "server-only";
import { cache } from "react";
import { z } from "zod";
import { getShowroomCategory } from "./showroom";
import { cmsText } from "./showroom-content";

const fieldSchema = z.object({
  technicalName: z.string().regex(/^[\p{L}\d_-]+$/u),
  type: z.enum(["text", "email", "textarea", "select", "number", "tel"]),
  label: z.string().nullish(),
  placeholder: z.string().nullish(),
  required: z.boolean().optional(),
  position: z.number().optional(),
  width: z.number().optional(),
  translated: z
    .object({
      label: z.string().nullish(),
      placeholder: z.string().nullish(),
      config: z.unknown(),
    })
    .nullish(),
});
const formSchema = z.object({
  id: z.string().regex(/^[a-f\d]{32}$/i),
  title: z.string(),
  successMessage: z.string(),
  translated: z
    .object({
      title: z.string().optional(),
      successMessage: z.string().optional(),
    })
    .optional(),
  groups: z.array(
    z.object({ position: z.number().optional(), fields: z.array(fieldSchema) }),
  ),
});
export type ShowroomFormDefinition = {
  id: string;
  title: string;
  successMessage: string;
  fields: {
    name: string;
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
    width: number;
    options: [string, string][];
  }[];
};
export function parseCmsForm(
  category: Awaited<ReturnType<typeof getShowroomCategory>>,
): ShowroomFormDefinition | null {
  for (const section of category?.cmsPage?.sections || [])
    for (const block of section.blocks || [])
      for (const slot of block.slots || []) {
        const parsed = formSchema.safeParse(
          slot.extensions?.swagCmsExtensionsForm,
        );
        if (!parsed.success) continue;
        const form = parsed.data;
        const fields = [...form.groups]
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .flatMap((g) =>
            [...g.fields].sort((a, b) => (a.position || 0) - (b.position || 0)),
          )
          .map((field) => {
            const config = field.translated?.config;
            const options =
              config && typeof config === "object" && !Array.isArray(config)
                ? (config as { options?: Record<string, string> }).options
                : undefined;
            return {
              name: field.technicalName,
              type: field.type,
              label: cmsText(
                field.translated?.label || field.label || field.technicalName,
              ),
              placeholder: cmsText(
                field.translated?.placeholder || field.placeholder || "",
              ),
              required: !!field.required,
              width: field.width || 12,
              options: Object.entries(options || {}).map(
                ([key, value]) => [key, cmsText(value)] as [string, string],
              ),
            };
          });
        return {
          id: form.id,
          title: cmsText(form.translated?.title || form.title),
          successMessage: cmsText(
            form.translated?.successMessage || form.successMessage,
          ),
          fields,
        };
      }
  return null;
}
export const getShowroomForm = cache(async () =>
  parseCmsForm(await getShowroomCategory()),
);
