import { z } from "zod";
import { cache } from "react";
import { storeRequest } from "./client";
import { contextSchema } from "./types";
export const getContext = cache(() =>
  storeRequest("/context", contextSchema, { method: "GET" }),
);

export const languageSchema = z.object({
  id: z.string(),
  name: z.string(),
  locale: z.object({ code: z.string() }).nullish(),
});
export const getLanguages = cache(() =>
  storeRequest("/language", z.object({ elements: z.array(languageSchema) }), {
    body: { associations: { locale: {} } },
  }),
);
