import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

/**
 * Sends a reply email to a customer. Silently no-ops (returns { skipped: true })
 * if RESEND_API_KEY isn't configured, so the in-app reply flow never breaks —
 * it just won't deliver an email until email sending is set up.
 */
export async function sendReplyEmail({
  to,
  customerName,
  companyName,
  message,
}: {
  to: string;
  customerName: string;
  companyName: string;
  message: string;
}): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const resend = getClient();
  if (!resend) {
    return { success: false, skipped: true, error: "RESEND_API_KEY is not configured" };
  }

  const fromAddress = process.env.EMAIL_FROM || "Loop <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject: `A reply from ${companyName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #12121A;">
          <p>Hi ${customerName},</p>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          <p style="color: #6B6B7B; font-size: 13px; margin-top: 32px;">— ${companyName}, via Loop</p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}
