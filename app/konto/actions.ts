"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginCustomer, logoutCustomer } from "@/lib/shopware/account";
import {
  clearSessionToken,
  readSessionToken,
  saveSessionToken,
} from "@/lib/shopware/session";
import {
  loginSchema,
  type LoginState,
} from "@/lib/shopware/account-validation";
import { ShopwareError } from "@/lib/shopware/client";
export async function signIn(
  _previous: LoginState,
  form: FormData,
): Promise<LoginState> {
  const input = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!input.success)
    return {
      error:
        "Bitte geben Sie eine gültige E-Mail-Adresse und Ihr Passwort ein.",
    };
  try {
    const { token } = await loginCustomer(
      input.data.email,
      input.data.password,
    );
    await saveSessionToken(token);
  } catch (error) {
    if (error instanceof ShopwareError && error.code === "THROTTLED")
      return {
        error:
          "Zu viele Anmeldeversuche. Bitte warten Sie etwas und versuchen Sie es erneut.",
      };
    if (
      error instanceof ShopwareError &&
      ["CREDENTIALS", "REJECTED"].includes(error.code)
    )
      return {
        error:
          "Die Anmeldung war nicht möglich. Bitte prüfen Sie Ihre Zugangsdaten und gegebenenfalls die Bestätigung Ihres Kundenkontos.",
      };
    return {
      error:
        "Die Anmeldung ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut.",
    };
  }
  revalidatePath("/", "layout");
  redirect("/konto");
}
export async function signOut() {
  const token = await readSessionToken();
  try {
    if (token) await logoutCustomer(token);
  } catch {
    /* Always end the local browser session, even during a backend outage. */
  }
  await clearSessionToken();
  revalidatePath("/", "layout");
  redirect("/konto/anmelden");
}
