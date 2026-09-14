"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const reasons = [
  "Marketing Consulting",
  "Operations Consulting",
  "Speaking Opportunity",
  "Partnership",
  "Mentorship / Coaching",
  "Other",
];

// Underline-only "ledger" fields for the single-line inputs — a vintage
// registration-card feel rather than a boxed SaaS input. The textarea below
// keeps a full boundary (see textareaClasses): a genuinely multi-line field
// reads as unfinished without one, where a single line does not.
const fieldClasses = "field-line w-full py-2.5 text-sm text-ink placeholder:text-muted";
const textareaClasses =
  "w-full resize-none rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-muted transition-colors duration-200 focus:border-accent-text focus:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMessage("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex h-full min-h-[26rem] flex-col items-center justify-center rounded-xl border border-line bg-canvas-raised p-10 text-center shadow-premium">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent-text">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-display text-xl font-medium text-ink">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Thanks for reaching out — expect a reply within 1–2 business days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="link-underline mt-6 text-sm font-medium text-accent-text"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-line bg-canvas-raised p-8 shadow-premium sm:p-10"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            className={cn(fieldClasses, "mt-2")}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={cn(fieldClasses, "mt-2")}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="company" className="text-sm font-medium text-ink">
            Company <span className="text-muted">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            className={cn(fieldClasses, "mt-2")}
            placeholder="Where you work"
          />
        </div>
        <div>
          <label htmlFor="reason" className="text-sm font-medium text-ink">
            Reason for reaching out
          </label>
          <select
            id="reason"
            name="reason"
            defaultValue={reasons[0]}
            className={cn(fieldClasses, "mt-2")}
          >
            {reasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="text-sm font-medium text-ink">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            rows={5}
            className={cn(textareaClasses, "mt-2")}
            placeholder="What are you working on?"
          />
        </div>
      </div>

      {status === "error" && errorMessage ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-ink px-7 py-4 text-[0.7rem] font-semibold tracking-[0.14em] text-canvas uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send Message
            <Send
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>
    </form>
  );
}
