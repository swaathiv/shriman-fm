import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, notify_email, notify_whatsapp } = body;

  if (!name || !email) {
    return Response.json({ error: "Name and email are required" }, { status: 400 });
  }

  const db = getDb();

  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (existing) {
    return Response.json(existing);
  }

  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    notify_email: notify_email ? 1 : 0,
    notify_whatsapp: notify_whatsapp && phone ? 1 : 0,
  };

  db.prepare(`
    INSERT INTO users (id, name, email, phone, notify_email, notify_whatsapp)
    VALUES (@id, @name, @email, @phone, @notify_email, @notify_whatsapp)
  `).run(user);

  return Response.json(user, { status: 201 });
}
