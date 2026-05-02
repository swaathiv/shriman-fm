import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, notify_email, notify_whatsapp } = body;

  if (!name || !email) {
    return Response.json({ error: "Name and email are required" }, { status: 400 });
  }

  const db = getDb();

  const existing = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email.trim().toLowerCase()],
  });
  if (existing.rows.length > 0) {
    return Response.json(existing.rows[0]);
  }

  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    notify_email: notify_email ? 1 : 0,
    notify_whatsapp: notify_whatsapp && phone ? 1 : 0,
  };

  await db.execute({
    sql: `INSERT INTO users (id, name, email, phone, notify_email, notify_whatsapp)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [user.id, user.name, user.email, user.phone, user.notify_email, user.notify_whatsapp],
  });

  return Response.json(user, { status: 201 });
}
