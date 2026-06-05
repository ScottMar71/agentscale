import { Resend } from "resend";

export function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  company?: string;
  message?: string;
}) {
  const resend = getResend();
  const to = process.env.CONTACT_EMAIL ?? "hello@agentscale.io";
  const from = process.env.RESEND_FROM_EMAIL ?? "AgentScale <onboarding@resend.dev>";

  if (!resend) {
    console.info("[AgentScale] Contact request (Resend not configured):", data);
    return { ok: true, demo: true };
  }

  await resend.emails.send({
    from,
    to: [to],
    subject: `Demo request from ${data.name}`,
    html: `
      <h2>New AgentScale demo request</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Company:</strong> ${data.company ?? "—"}</p>
      <p><strong>Message:</strong> ${data.message ?? "—"}</p>
    `,
  });

  return { ok: true };
}

export async function sendOrgInviteEmail(data: {
  to: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL ?? "AgentScale <onboarding@resend.dev>";

  if (!resend) {
    console.info("[AgentScale] Org invite (Resend not configured):", data);
    return { ok: true, demo: true };
  }

  await resend.emails.send({
    from,
    to: [data.to],
    subject: `You're invited to ${data.organizationName} on AgentScale`,
    html: `
      <h2>Join ${data.organizationName} on AgentScale</h2>
      <p>${data.inviterName} invited you as <strong>${data.role.replace("_", " ")}</strong>.</p>
      <p><a href="${data.inviteUrl}">Accept invitation</a></p>
      <p>This link expires in 7 days. If you don't have an account yet, sign up with this email first.</p>
    `,
  });

  return { ok: true };
}
