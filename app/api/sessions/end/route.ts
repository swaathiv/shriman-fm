import { ensureDb, toObj } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import type { Session } from "@/lib/db";

export async function POST(request: Request) {
  const { session_id } = await request.json();

  if (!session_id) {
    return Response.json({ error: "session_id is required" }, { status: 400 });
  }

  const db = await ensureDb();

  await db.execute({
    sql: `UPDATE sessions SET status = 'ended', ended_at = datetime('now') WHERE id = ?`,
    args: [session_id],
  });

  const result = await db.execute({ sql: "SELECT * FROM sessions WHERE id = ?", args: [session_id] });
  const session = toObj<Session>(result);

  broadcast("session_ended", { session_id });
  return Response.json(session);
}
