import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required." },
        { status: 400 }
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report problem email error:", error);

    return NextResponse.json(
      { error: "Failed to send report." },
      { status: 500 }
    );
  }
}