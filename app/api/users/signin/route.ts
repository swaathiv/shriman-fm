import { ensureDb } from "@/lib/db";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const db = await ensureDb();
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email.trim().toLowerCase()],
  });

  if (result.rows.length === 0) {
    return Response.json(
      { error: "No account found with that email. Please sign up first." },
      { status: 404 }
    );
  }

  return Response.json(result.rows[0]);
}
