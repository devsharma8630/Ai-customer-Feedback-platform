import "server-only";
import emailjs from "@emailjs/nodejs";

/**
 * Sends a reply email to a customer via EmailJS. Silently no-ops (returns
 * { skipped: true }) if the required env vars aren't set, so the in-app
 * reply flow never breaks — it just won't deliver an email until configured.
 *
 * Requires an EmailJS template (created at dashboard.emailjs.com) with these
 * variables used in the template body/subject:
 *   {{to_email}}   {{to_name}}   {{company_name}}   {{message}}
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
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    return { success: false, skipped: true, error: "EmailJS env vars are not configured" };
  }

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: to,
        to_name: customerName,
        company_name: companyName,
        message,
      },
      { publicKey, privateKey }
    );

    if (response.status !== 200) {
      return { success: false, error: response.text || "EmailJS returned a non-200 status" };
    }
    return { success: true };
  }catch (err: any) {
  console.error("========== EMAILJS ERROR ==========");
  console.error(err);
  console.error("Message:", err?.message);
  console.error("Text:", err?.text);
  console.error("Status:", err?.status);
  console.error("Response:", err?.response);
  console.error("===================================");

  return {
    success: false,
    error: JSON.stringify(err, null, 2),
  };
}
}