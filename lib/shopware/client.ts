import "server-only";
import { z } from "zod";
import { shopwareConfig } from "./config";
export class ShopwareError extends Error {
  constructor(
    public code:
      | "CONFIGURATION"
      | "UNAVAILABLE"
      | "TIMEOUT"
      | "CREDENTIALS"
      | "NOT_FOUND"
      | "RESPONSE",
    public status?: number,
  ) {
    super(code);
  }
}
export async function storeRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: {
    body?: unknown;
    contextToken?: string;
    method?: "GET" | "POST";
  } = {},
): Promise<T> {
  let config;
  try {
    config = shopwareConfig();
  } catch {
    throw new ShopwareError("CONFIGURATION");
  }
  let response: Response;
  try {
    response = await fetch(`${config.url}${path}`, {
      method: options.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "sw-access-key": config.key,
        "sw-include-seo-urls": "true",
        "sw-inheritance": "true",
        ...(options.contextToken
          ? { "sw-context-token": options.contextToken }
          : {}),
      },
      body:
        options.method === "GET"
          ? undefined
          : JSON.stringify(options.body ?? {}),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    throw new ShopwareError(
      error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError")
        ? "TIMEOUT"
        : "UNAVAILABLE",
    );
  }
  if (!response.ok)
    throw new ShopwareError(
      response.status === 401 || response.status === 403
        ? "CREDENTIALS"
        : response.status === 404
          ? "NOT_FOUND"
          : "UNAVAILABLE",
      response.status,
    );
  try {
    return schema.parse(await response.json());
  } catch {
    throw new ShopwareError("RESPONSE");
  }
}
export function publicError(error: unknown) {
  const code = error instanceof ShopwareError ? error.code : "UNAVAILABLE";
  return {
    code,
    message:
      code === "CONFIGURATION"
        ? "Der Produktkatalog wird eingerichtet. Bitte versuchen Sie es später erneut."
        : "Der Produktkatalog ist vorübergehend nicht erreichbar. Bitte versuchen Sie es später erneut.",
  };
}
