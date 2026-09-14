import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single-admin authentication with no database.
 *
 * The session is a signed cookie: `<base64url payload>.<HMAC-SHA256>`. Nothing
 * is stored server-side, so this works across restarts and across multiple
 * instances as long as `AUTH_SECRET` is the same everywhere.
 *
 * Trade-off worth knowing: because there is no server-side session list, a
 * session cannot be revoked individually. Rotating `AUTH_SECRET` invalidates
 * every session at once, which is the intended "log everyone out" lever.
 */

export const SESSION_COOKIE = "mh_admin";

/** Sessions last a week; long enough to be convenient, short enough to expire. */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface AuthConfigError {
  configured: false;
  missing: string[];
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

/**
 * Fail closed. With no password or secret set, the dashboard must refuse to
 * authenticate anyone rather than fall back to a default — an unset variable
 * in production is exactly when a default would be most dangerous.
 */
export function authConfig(): { configured: true; password: string; secret: string } | AuthConfigError {
  const password = readEnv("ADMIN_PASSWORD");
  const secret = readEnv("AUTH_SECRET");
  const missing: string[] = [];
  if (!password) missing.push("ADMIN_PASSWORD");
  if (!secret) missing.push("AUTH_SECRET");
  if (!password || !secret) return { configured: false, missing };
  return { configured: true, password, secret };
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Constant-time compare that tolerates length mismatch without leaking it. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still burn a comparison so the failure takes a similar amount of time.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(candidate: string): boolean {
  const config = authConfig();
  if (!config.configured) return false;
  return safeEqual(candidate, config.password);
}

function createToken(secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      // Random id so two tokens issued in the same second differ.
      jti: randomBytes(8).toString("hex"),
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function verifyToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const index = token.lastIndexOf(".");
  if (index <= 0) return false;
  const payload = token.slice(0, index);
  const signature = token.slice(index + 1);
  if (!safeEqual(signature, sign(payload, secret))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof parsed.exp === "number" && parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** True when the caller presents a valid, unexpired session cookie. */
export async function isAuthenticated(): Promise<boolean> {
  const config = authConfig();
  if (!config.configured) return false;
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value, config.secret);
}

export async function startSession(): Promise<void> {
  const config = authConfig();
  if (!config.configured) throw new Error("Auth is not configured");
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(config.secret), {
    httpOnly: true,
    sameSite: "lax",
    // Only force Secure in production: local development runs over plain HTTP
    // and the browser would silently drop the cookie.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Gate for every mutating action. Server Actions are public POST endpoints —
 * rendering a form behind a login page is not a security boundary, so each
 * action calls this itself rather than trusting that the UI was reachable.
 */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) throw new Error("Not authorised");
}
