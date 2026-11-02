import "server-only";
import { cache } from "react";
import { z } from "zod";
import { storeRequest, ShopwareError } from "./client";
import { readSessionToken, validContextToken } from "./session";
const customerSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  guest: z.boolean(),
});
export type Customer = z.infer<typeof customerSchema>;
export const getCustomer = cache(async () => {
  const token = await readSessionToken();
  if (!token) return null;
  try {
    const customer = await storeRequest("/account/customer", customerSchema, {
      contextToken: token,
    });
    return customer.guest ? null : customer;
  } catch (error) {
    if (
      error instanceof ShopwareError &&
      (error.code === "CREDENTIALS" || error.code === "NOT_FOUND")
    )
      return null;
    throw error;
  }
});
export async function loginCustomer(username: string, password: string) {
  const response = await storeRequest(
    "/account/login",
    z.object({ contextToken: z.string().refine(validContextToken) }),
    { body: { username, password } },
  );
  const customer = await storeRequest("/account/customer", customerSchema, {
    contextToken: response.contextToken,
  });
  if (customer.guest) throw new ShopwareError("CREDENTIALS");
  return { token: response.contextToken, customer };
}
export async function logoutCustomer(token: string) {
  return storeRequest(
    "/account/logout",
    z.object({ contextToken: z.string().refine(validContextToken) }),
    { contextToken: token },
  );
}
// These existing public storefront routes preserve business registration,
// customer-group approval and Shopware's email confirmation/recovery flows.
export const shopwareAccountLinks = {
  register: "https://viero-deutschland.de/registrierung?nr",
  recover: "https://viero-deutschland.de/account/recover",
};
