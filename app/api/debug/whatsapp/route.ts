import { ensureDb, toRows } from "@/lib/db";

export async function GET() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!sid || !token || !from) {
    return Response.json({ error: "Twilio env vars missing", sid: !!sid, token: !!token, from: !!from }, { status: 500 });
  }

  const db = await ensureDb();
  const result = await db.execute("SELECT name, phone, notify_whatsapp FROM users WHERE notify_whatsapp = 1 AND phone IS NOT NULL");
  const users = toRows<{ name: string; phone: string; notify_whatsapp: number }>(result);

  if (users.length === 0) {
    return Response.json({ error: "No users with WhatsApp opted in" }, { status: 400 });
  }

  const twilio = (await import("twilio")).default;
  const client = twilio(sid, token);

  const results = await Promise.allSettled(
    users.map((u) =>
      client.messages.create({
        from: `whatsapp:${from}`,
        to: `whatsapp:${u.phone.replace(/\s+/g, "")}`,
        body: `👋 Test message from Shirman FM! Your WhatsApp notifications are working.`,
      })
    )
  );

  return Response.json(results.map((r, i) => ({
    phone: users[i].phone,
    status: r.status,
    ...(r.status === "fulfilled" ? { sid: r.value.sid } : { error: (r.reason as Error).message }),
  })));
}
