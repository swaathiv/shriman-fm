import { createToken } from "@/lib/livekit";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { session_id, participant_name, is_broadcaster } = body;

  if (!session_id || !participant_name) {
    return Response.json({ error: "session_id and participant_name are required" }, { status: 400 });
  }

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM sessions WHERE id = ?",
    args: [session_id],
  });

  if (result.rows.length === 0) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const session = result.rows[0] as unknown as { livekit_room: string; status: string };

  if (session.status === "ended") {
    return Response.json({ error: "Session has ended" }, { status: 410 });
  }

  const token = await createToken(session.livekit_room as string, participant_name, !!is_broadcaster);

  return Response.json({ token, room: session.livekit_room });
}
