"use client";
import { useActionState, useState } from "react";
import { signIn } from "@/app/konto/actions";
import styles from "./account.module.css";
export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {});
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={action} className={styles.form}>
      {state.error && (
        <p className={styles.error} role="alert" id="login-error">
          {state.error}
        </p>
      )}
      <label htmlFor="customer-email">E-Mail-Adresse</label>
      <input
        id="customer-email"
        name="email"
        type="email"
        autoComplete="username"
        required
        maxLength={254}
        aria-describedby={state.error ? "login-error" : undefined}
      />
      <label htmlFor="customer-password">Passwort</label>
      <div className={styles.password}>
        <input
          id="customer-password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          maxLength={4096}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-pressed={showPassword}
          aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
        >
          {showPassword ? "Verbergen" : "Anzeigen"}
        </button>
      </div>
      <button className={styles.submit} disabled={pending} type="submit">
        {pending ? "Wird angemeldet …" : "Anmelden"}
      </button>
      <p className={styles.hint}>
        Ihre bisherigen Zugangsdaten von Viero Deutschland bleiben gültig.
      </p>
    </form>
  );
}
