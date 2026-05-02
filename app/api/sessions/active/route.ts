import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const sessions = db
    .prepare("SELECT * FROM sessions WHERE status = 'live' ORDER BY started_at DESC")
    .all();
  return Response.json(sessions);
}
