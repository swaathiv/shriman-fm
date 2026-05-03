import { ensureDb, toObj } from "@/lib/db";
import type { Session } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await ensureDb();
  const result = await db.execute({ sql: "SELECT * FROM sessions WHERE id = ?", args: [id] });
  if (result.rows.length === 0) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  return Response.json(toObj<Session>(result));
}
