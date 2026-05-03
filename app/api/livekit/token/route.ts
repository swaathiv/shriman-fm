import { createToken } from "@/lib/livekit";
import { ensureDb, toObj } from "@/lib/db";
import type { Session } from "@/lib/db";

export async function POST(request: Request) {
  const { session_id, participant_name, is_broadcaster } = await request.json();

  if (!session_id || !participant_name) {
    return Response.json({ error: "session_id and participant_name are required" }, { status: 400 });
  }

  const db = await ensureDb();
  const result = await db.execute({ sql: "SELECT * FROM sessions WHERE id = ?", args: [session_id] });

  if (result.rows.length === 0) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const session = toObj<Session>(result);

  if (session.status === "ended") {
    return Response.json({ error: "Session has ended" }, { status: 410 });
  }

  const token = await createToken(session.livekit_room, participant_name, !!is_broadcaster);
  return Response.json({ token, room: session.livekit_room });
}
