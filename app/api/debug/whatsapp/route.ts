import { ensureDb } from "@/lib/db";

export async function GET() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!sid || !token || !from) {
    return Response.json(
      { error: "Twilio env vars missing", sid: !!sid, token: !!token, from: !!from },
      { status: 500 }
    );
  }

  const db = await ensureDb();
  const result = await db.execute(
    "SELECT name, phone, notify_whatsapp FROM users WHERE notify_whatsapp = 1 AND phone IS NOT NULL"
  );
  const users = result.rows as unknown as { name: string; phone: string; notify_whatsapp: number }[];

  if (users.length === 0) {
    return Response.json({ error: "No users with WhatsApp opted in" }, { status: 400 });
  }

  const twilio = (await import("twilio")).default;
  const client = twilio(sid, token);

  const results = await Promise.allSettled(
    users.map((u) => {
      const phone = u.phone.replace(/\s+/g, "");
      return client.messages.create({
        from: `whatsapp:${from}`,
        to: `whatsapp:${phone}`,
        body: `👋 Test message from Shirman FM! Your WhatsApp notifications are working.`,
      });
    })
  );

  const output = results.map((r, i) => ({
    phone: users[i].phone,
    status: r.status,
    ...(r.status === "fulfilled"
      ? { sid: r.value.sid }
      : { error: (r.reason as Error).message }),
  }));

  return Response.json(output);
}
