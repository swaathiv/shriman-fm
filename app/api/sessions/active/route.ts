import { ensureDb, toRows } from "@/lib/db";
import type { Session } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await ensureDb();
  const result = await db.execute("SELECT * FROM sessions WHERE status = 'live' ORDER BY started_at DESC");
  return Response.json(toRows<Session>(result));
}
