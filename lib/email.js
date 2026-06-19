const resendEndpoint = "https://api.resend.com/emails";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendTransactionalEmail({
  to,
  subject,
  title,
  message,
  actionLabel,
  actionUrl,
  attachments = []
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("RESEND_API_KEY e EMAIL_FROM precisam estar configurados.");
  }

  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeActionLabel = escapeHtml(actionLabel);
  const safeActionUrl = escapeHtml(actionUrl);

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      attachments,
      html: `
        <div style="background:#f4f6f8;padding:32px;font-family:Arial,sans-serif;color:#17202a">
          <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #d8dee8;border-radius:12px;padding:32px">
            <p style="color:#166c7d;font-weight:700;margin-top:0">Currículo Pro</p>
            <h1 style="font-size:24px">${safeTitle}</h1>
            <p style="line-height:1.6">${safeMessage}</p>
            <p style="margin:28px 0">
              <a href="${safeActionUrl}" style="background:#166c7d;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block">${safeActionLabel}</a>
            </p>
            <p style="font-size:13px;color:#637083;word-break:break-all">Se o botão não funcionar, acesse: ${safeActionUrl}</p>
          </div>
        </div>
      `
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Falha ao enviar e-mail (${response.status}): ${errorBody}`);
  }
}
