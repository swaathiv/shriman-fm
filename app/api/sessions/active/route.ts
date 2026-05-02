import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const result = await db.execute(
    "SELECT * FROM sessions WHERE status = 'live' ORDER BY started_at DESC"
  );
  return Response.json(result.rows);
}
