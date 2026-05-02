import { getDb } from "@/lib/db";
import { broadcast } from "@/lib/sse";

export async function POST(request: Request) {
  const body = await request.json();
  const { session_id } = body;

  if (!session_id) {
    return Response.json({ error: "session_id is required" }, { status: 400 });
  }

  const db = getDb();

  db.prepare(`
    UPDATE sessions SET status = 'ended', ended_at = datetime('now') WHERE id = ?
  `).run(session_id);

  const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(session_id);

  broadcast("session_ended", { session_id });

  return Response.json(session);
}
