import { User, Session } from "./db";

export async function sendEmailNotification(users: User[], session: Session) {
  if (!process.env.RESEND_API_KEY) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const recipients = users
    .filter((u) => u.notify_email)
    .map((u) => u.email);

  if (recipients.length === 0) return;

  const watchUrl = `${process.env.NEXT_PUBLIC_APP_URL}/watch/${session.id}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@shirman.fm",
    to: recipients,
    subject: `🔴 Live Now: ${session.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#e11d48">🔴 Session Live</h2>
        <p><strong>${session.host_name}</strong> just started a live session:</p>
        <h3>${session.title}</h3>
        <p>Mode: ${session.mode === "video" ? "Audio + Video" : "Audio Only"}</p>
        <a href="${watchUrl}" style="display:inline-block;padding:12px 24px;background:#e11d48;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">
          Join Now
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">You're receiving this because you signed up for Shirman FM notifications.</p>
      </div>
    `,
  });
}

export async function sendWhatsAppNotification(users: User[], session: Session) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return;

  const twilio = (await import("twilio")).default;
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const watchUrl = `${process.env.NEXT_PUBLIC_APP_URL}/watch/${session.id}`;
  const body = `🔴 *${session.title}* is LIVE on Shirman FM!\nHosted by ${session.host_name}.\n\nJoin here: ${watchUrl}`;

  const recipients = users.filter(
    (u) => u.notify_whatsapp && u.phone
  );

  const results = await Promise.allSettled(
    recipients.map((u) => {
      // Strip spaces so "+31 658961903" becomes "+31658961903"
      const phone = u.phone!.replace(/\s+/g, "");
      return client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phone}`,
        body,
      });
    })
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`WhatsApp failed for ${recipients[i].phone}:`, r.reason);
    } else {
      console.log(`WhatsApp sent to ${recipients[i].phone}: SID ${r.value.sid}`);
    }
  });
}
