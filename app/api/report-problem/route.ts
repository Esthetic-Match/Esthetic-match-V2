import { sendEmail } from "@/lib/utils/email";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!subject || !message) {
    throw new ApiError(
      "Subject and message are required.",
      400,
      "SUBJECT_AND_MESSAGE_REQUIRED"
    );
  }

  await sendEmail({
    to: "estheticmatch@gmail.com",
    subject: `[Problem Report] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Problem Report</h2>

        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>

        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
          ${escapeHtml(message)}
        </div>
      </div>
    `,
  });

  return apiSuccess({
    success: true,
  });
});