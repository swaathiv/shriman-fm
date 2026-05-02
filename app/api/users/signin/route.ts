import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());

  if (!user) {
    return Response.json({ error: "No account found with that email. Please sign up first." }, { status: 404 });
  }

  return Response.json(user);
}
