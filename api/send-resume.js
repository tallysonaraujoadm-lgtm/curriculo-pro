import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { sendTransactionalEmail } from "../lib/email.js";

const MAX_PDF_BYTES = 8 * 1024 * 1024;

function json(res, status, body) {
  return res.status(status).json(body);
}

function validPdf(content) {
  if (typeof content !== "string" || !content) return null;

  try {
    const buffer = Buffer.from(content, "base64");
    if (!buffer.length || buffer.length > MAX_PDF_BYTES) return null;
    if (buffer.subarray(0, 4).toString("ascii") !== "%PDF") return null;
    return buffer;
  } catch {
    return null;
  }
}

function safeFileName(value) {
  const name = String(value || "curriculo.pdf")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 100);
  return name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Método não permitido." });
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    const user = session?.user;
    if (!user) {
      return json(res, 401, { error: "Entre na sua conta para enviar o currículo." });
    }
    if (!user.emailVerified) {
      return json(res, 403, { error: "Confirme seu e-mail antes de enviar o currículo." });
    }

    const pdf = validPdf(req.body?.pdfBase64);
    if (!pdf) {
      return json(res, 400, { error: "O arquivo PDF é inválido ou muito grande." });
    }

    await sendTransactionalEmail({
      to: user.email,
      subject: "Seu currículo do Currículo Pro",
      title: "Seu currículo está pronto",
      message: "O PDF do seu currículo está anexado a este e-mail.",
      actionLabel: "Abrir Currículo Pro",
      actionUrl: process.env.BETTER_AUTH_URL,
      attachments: [{
        filename: safeFileName(req.body?.fileName),
        content: pdf.toString("base64")
      }]
    });

    return json(res, 200, { sent: true });
  } catch (error) {
    console.error(error);
    return json(res, 500, {
      error: "Não foi possível enviar o currículo. Verifique a configuração da Resend."
    });
  }
}
