import { getDb, User } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import { sendEmailNotification, sendWhatsAppNotification } from "@/lib/notify";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { title, host_name, host_email, mode, save_recording } = body;

  if (!title || !host_name || !host_email || !mode) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();

  const roomName = `session-${randomUUID()}`;
  const session = {
    id: randomUUID(),
    title: title.trim(),
    host_name: host_name.trim(),
    host_email: host_email.trim().toLowerCase(),
    mode,
    save_recording: save_recording ? 1 : 0,
    livekit_room: roomName,
    status: "live",
  };

  db.prepare(`
    INSERT INTO sessions (id, title, host_name, host_email, mode, save_recording, livekit_room, status)
    VALUES (@id, @title, @host_name, @host_email, @mode, @save_recording, @livekit_room, @status)
  `).run(session);

  const fullSession = db.prepare("SELECT * FROM sessions WHERE id = ?").get(session.id) as import("@/lib/db").Session;

  // Notify all connected browser clients via SSE
  broadcast("session_started", fullSession);

  // Fire email + WhatsApp notifications in the background
  const users = db.prepare("SELECT * FROM users").all() as User[];
  sendEmailNotification(users, fullSession).catch(() => {});
  sendWhatsAppNotification(users, fullSession).catch(() => {});

  return Response.json(fullSession, { status: 201 });
}
