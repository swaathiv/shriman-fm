"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notify_email: true,
    notify_whatsapp: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      localStorage.setItem("shirman_user", JSON.stringify(data));
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center px-6 py-4 border-b border-zinc-800">
        <Link href="/" className="text-xl font-bold tracking-tight">
          📻 Shirman<span className="text-rose-500">.fm</span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-zinc-400 mb-8 text-sm">
            Sign up to get notified when sessions go live.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                type="text"
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                WhatsApp Number{" "}
                <span className="text-zinc-500 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-sm font-medium">Notify me via</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.notify_email}
                  onChange={(e) => setForm({ ...form, notify_email: e.target.checked })}
                  className="w-4 h-4 accent-rose-500"
                />
                <span className="text-sm">Email when a session starts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.notify_whatsapp}
                  onChange={(e) => setForm({ ...form, notify_whatsapp: e.target.checked })}
                  className="w-4 h-4 accent-rose-500"
                  disabled={!form.phone}
                />
                <span className={`text-sm ${!form.phone ? "text-zinc-600" : ""}`}>
                  WhatsApp when a session starts
                  {!form.phone && " (add a number above)"}
                </span>
              </label>
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-950 px-4 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already signed up?{" "}
            <Link href="/" className="text-rose-400 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
