import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  reason?: unknown;
  message?: unknown;
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, company, reason, message } = body;

  if (typeof name !== "string" || name.trim().length < 2) {
    return Response.json(
      { error: "Please enter your name." },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (typeof message !== "string" || message.trim().length < 10) {
    return Response.json(
      { error: "Please include a short message (10 characters or more)." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not set — see .env.example. Contact form cannot deliver mail.",
    );
    return Response.json(
      {
        error:
          "This form isn't fully configured yet — please email directly instead.",
      },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  const safeCompany = typeof company === "string" ? company.trim() : "";
  const safeReason = typeof reason === "string" ? reason.trim() : "";

  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio Contact Form <onboarding@resend.dev>",
    to: siteConfig.email,
    replyTo: email,
    subject: `New inquiry from ${name.trim()}${safeReason ? ` — ${safeReason}` : ""}`,
    text: [
      `Name: ${name.trim()}`,
      `Email: ${email}`,
      safeCompany ? `Company: ${safeCompany}` : null,
      safeReason ? `Reason: ${safeReason}` : null,
      "",
      message.trim(),
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
  });

  if (error) {
    console.error("Resend error:", error);
    return Response.json(
      { error: "Something went wrong sending your message. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
