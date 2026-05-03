import { ensureDb, toObj, toRows } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import { sendEmailNotification, sendWhatsAppNotification } from "@/lib/notify";
import { randomUUID } from "crypto";
import type { User, Session } from "@/lib/db";

export async function POST(request: Request) {
  console.log("[session/start] request received");

  const body = await request.json();
  const { title, host_name, host_email, mode, save_recording } = body;

  if (!title || !host_name || !host_email || !mode) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = await ensureDb();
  console.log("[session/start] db ready");

  const id = randomUUID();
  const roomName = `session-${randomUUID()}`;

  await db.execute({
    sql: `INSERT INTO sessions (id, title, host_name, host_email, mode, save_recording, livekit_room, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'live')`,
    args: [id, title.trim(), host_name.trim(), host_email.trim().toLowerCase(), mode, save_recording ? 1 : 0, roomName],
  });

  const sessionResult = await db.execute({ sql: "SELECT * FROM sessions WHERE id = ?", args: [id] });
  const fullSession = toObj<Session>(sessionResult);
  console.log("[session/start] session created:", id);

  broadcast("session_started", fullSession);

  const usersResult = await db.execute("SELECT * FROM users");
  const users = toRows<User>(usersResult);
  console.log("[session/start] notifying users:", users.length, "users found");

  await Promise.all([
    sendEmailNotification(users, fullSession).catch((e) => console.error("[session/start] Email error:", e)),
    sendWhatsAppNotification(users, fullSession).catch((e) => console.error("[session/start] WhatsApp error:", e)),
  ]);

  console.log("[session/start] notifications done");
  return Response.json(fullSession, { status: 201 });
}
