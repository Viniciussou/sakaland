import nodemailer from "nodemailer";
import { Notification, User } from "@/models";
import connectToDatabase from "@/lib/mongodb";

/**
 * Envia um e-mail usando as credenciais SMTP definidas em .env.local.
 * Se as variáveis não estiverem configuradas, a função registra um aviso
 * no console e não lança erro — isso evita quebrar o fluxo de compra em
 * ambientes de desenvolvimento sem SMTP configurado.
 */
export async function sendEmail(to: string[], subject: string, html: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn(
      "[email] SMTP não configurado — pulando envio. Configure SMTP_* no .env.local"
    );
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: to.join(","),
    subject,
    html,
  });
}

/**
 * Envia uma mensagem via WhatsApp usando a API da Twilio.
 * Requer TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN configurados.
 * Se não configurado, apenas registra um aviso (não bloqueia o fluxo).
 */
export async function sendWhatsApp(to: string[], message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    console.warn(
      "[whatsapp] Twilio não configurado — pulando envio. Configure TWILIO_* no .env.local"
    );
    return { skipped: true };
  }

  const results = [];
  for (const number of to) {
    const body = new URLSearchParams({
      To: number,
      From: from,
      Body: message,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString(
            "base64"
          )}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    results.push(await res.json());
  }
  return results;
}

/**
 * Cria uma notificação in-app (armazenada no MongoDB) para um usuário.
 */
export async function createInAppNotification(
  recipientId: string,
  title: string,
  message: string,
  meta?: Record<string, unknown>
) {
  await connectToDatabase();
  return Notification.create({
    recipient: recipientId,
    title,
    message,
    channel: "system",
    meta,
  });
}

/**
 * Notifica todos os administradores (e-mail + WhatsApp + notificação in-app)
 * quando um participante resgata um item da loja.
 */
export async function notifyAdminsOfPurchase(params: {
  participantName: string;
  rewardName: string;
  price: number;
}) {
  await connectToDatabase();

  const admins = await User.find({ role: "admin" }).select("_id email").lean();

  const subject = `Novo resgate: ${params.rewardName}`;
  const html = `
    <div style="font-family:sans-serif;background:#0B0B0D;color:#F5F5F0;padding:24px;">
      <h2 style="color:#C8102E;">Novo resgate no Sakaland</h2>
      <p><strong>${params.participantName}</strong> resgatou <strong>${params.rewardName}</strong> por ${params.price} Sakalekas.</p>
    </div>
  `;
  const whatsappMessage = `🎁 Sakaland: ${params.participantName} resgatou "${params.rewardName}" por ${params.price} Sakalekas.`;

  const envEmails = (process.env.ADMIN_NOTIFICATION_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const emailTargets = envEmails.length
    ? envEmails
    : admins.map((a) => a.email).filter(Boolean);

  const whatsappTargets = (process.env.ADMIN_WHATSAPP_NUMBERS || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  const tasks: Promise<unknown>[] = [];

  if (emailTargets.length) {
    tasks.push(sendEmail(emailTargets, subject, html));
  }
  if (whatsappTargets.length) {
    tasks.push(sendWhatsApp(whatsappTargets, whatsappMessage));
  }
  for (const admin of admins) {
    tasks.push(
      createInAppNotification(admin._id.toString(), subject, whatsappMessage)
    );
  }

  await Promise.allSettled(tasks);
}
