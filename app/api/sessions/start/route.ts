import { getDb } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import { sendEmailNotification, sendWhatsAppNotification } from "@/lib/notify";
import { randomUUID } from "crypto";
import type { User, Session } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { title, host_name, host_email, mode, save_recording } = body;

  if (!title || !host_name || !host_email || !mode) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const id = randomUUID();
  const roomName = `session-${randomUUID()}`;

  await db.execute({
    sql: `INSERT INTO sessions (id, title, host_name, host_email, mode, save_recording, livekit_room, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'live')`,
    args: [id, title.trim(), host_name.trim(), host_email.trim().toLowerCase(), mode, save_recording ? 1 : 0, roomName],
  });

  const sessionResult = await db.execute({
    sql: "SELECT * FROM sessions WHERE id = ?",
    args: [id],
  });
  const fullSession = sessionResult.rows[0] as unknown as Session;

  broadcast("session_started", fullSession);

  const usersResult = await db.execute("SELECT * FROM users");
  const users = usersResult.rows as unknown as User[];

  sendEmailNotification(users, fullSession).catch((e) => console.error("Email error:", e));
  sendWhatsAppNotification(users, fullSession).catch((e) => console.error("WhatsApp error:", e));

  return Response.json(fullSession, { status: 201 });
}
