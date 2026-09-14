import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authConfig, isAuthenticated } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  // The dashboard is unlisted, not secret, but there is no reason for it to
  // appear in search results.
  robots: { index: false, follow: false },
};

// Reads the session cookie, so it can never be prerendered.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/dashboard");

  const config = authConfig();

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-24">
      <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase">
        <span className="h-px w-6 bg-accent-text" aria-hidden="true" />
        {siteConfig.name}
      </span>
      <h1 className="mt-5 font-display text-4xl font-medium text-ink">Media dashboard</h1>
      <p className="mt-3 text-ink-soft">
        Sign in to add, replace, or remove photography and video.
      </p>

      {config.configured ? (
        <LoginForm />
      ) : (
        <div className="mt-10 rounded-xl border border-error/40 bg-canvas-raised p-6">
          <p className="font-medium text-ink">The dashboard is not configured yet.</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Set{" "}
            {config.missing.map((name, index) => (
              <span key={name}>
                {index > 0 ? " and " : ""}
                <code className="rounded-sm bg-accent-soft px-1.5 py-0.5 text-accent-text">
                  {name}
                </code>
              </span>
            ))}{" "}
            in the environment, then restart the server. Sign-in stays disabled until then —
            see <code className="text-accent-text">docs/DEPLOYMENT.md</code>.
          </p>
        </div>
      )}
    </div>
  );
}
