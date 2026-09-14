"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction, type ActionState } from "../actions";

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="mt-10">
      <label
        htmlFor="password"
        className="text-xs font-semibold tracking-[0.2em] text-muted uppercase"
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        // Reuses the site's own underline field treatment rather than
        // introducing a second input style.
        className="field-line mt-3 w-full py-2.5 text-lg text-ink"
      />

      {state.message ? (
        <p role="alert" className="mt-4 text-sm text-error">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-ink px-7 py-4 text-[0.7rem] font-semibold tracking-[0.14em] text-canvas uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium disabled:pointer-events-none disabled:opacity-50"
      >
        <LogIn className="size-4" aria-hidden="true" />
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
