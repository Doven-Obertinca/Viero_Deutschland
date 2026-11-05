import {
  normalizeChoices,
  type ConsentChoices,
  type ConsentConfig,
} from "./cookie-model";
export const CONSENT_COOKIE = "viero-cookie-consent";
export function consentDays(config: ConsentConfig) {
  return Math.min(
    30,
    ...config.groups.flatMap((g) =>
      g.entries.filter((e) => !e.required).map((e) => e.days),
    ),
  );
}
export function readConsent(
  raw: string | undefined,
  config: ConsentConfig,
): ConsentChoices | null {
  if (!raw) return null;
  try {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = JSON.parse(decodeURIComponent(raw));
    }
    return data?.version === config.version
      ? normalizeChoices(config.groups, data.choices)
      : null;
  } catch {
    return null;
  }
}
export function consentWrites(config: ConsentConfig, input: unknown) {
  const choices = normalizeChoices(config.groups, input);
  const days = consentDays(config);
  return [
    {
      name: CONSENT_COOKIE,
      value: JSON.stringify({ version: config.version, choices }),
      maxAge: days * 86400,
    },
    { name: "cookie-preference", value: "1", maxAge: days * 86400 },
    ...config.groups.flatMap((g) =>
      g.entries
        .filter((e) => !e.required)
        .map((e) => ({
          name: e.name,
          value: choices[e.name] ? e.value : "",
          maxAge: choices[e.name] ? e.days * 86400 : 0,
        })),
    ),
  ];
}
