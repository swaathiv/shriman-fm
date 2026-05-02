"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BroadcastRoom from "@/components/BroadcastRoom";

interface Session {
  id: string;
  title: string;
  livekit_room: string;
  mode: "audio" | "video";
  save_recording: number;
}

interface StoredUser {
  name: string;
  email: string;
}

export default function BroadcastPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [form, setForm] = useState({
    title: "",
    mode: "audio" as "audio" | "video",
    save_recording: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("shirman_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function startSession(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          host_name: user.name,
          host_email: user.email,
          mode: form.mode,
          save_recording: form.save_recording,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start session");

      const tokenRes = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: data.id,
          participant_name: user.name,
          is_broadcaster: true,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error || "Failed to get token");

      setSession(data);
      setToken(tokenData.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    if (!session) return;
    await fetch("/api/sessions/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session.id }),
    });
    router.push("/");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">You need an account to broadcast.</p>
        <Link
          href="/register"
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl font-semibold transition-colors"
        >
          Create Account
        </Link>
      </div>
    );
  }

  if (session && token) {
    return (
      <BroadcastRoom
        session={session}
        token={token}
        onEnd={endSession}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <Link href="/" className="text-xl font-bold tracking-tight">
          📻 Shirman<span className="text-rose-500">.fm</span>
        </Link>
        <span className="text-sm text-zinc-400">Hi, {user.name}</span>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2">Start a session</h1>
          <p className="text-zinc-400 mb-8 text-sm">
            Everyone will be notified the moment you go live.
          </p>

          <form onSubmit={startSession} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Session Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Morning Update, Q&A Session…"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Stream Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {(["audio", "video"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, mode: m })}
                    className={`py-4 rounded-xl border text-sm font-medium transition-colors flex flex-col items-center gap-2 ${
                      form.mode === m
                        ? "border-rose-500 bg-rose-950 text-rose-300"
                        : "border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    <span className="text-2xl">{m === "audio" ? "🎙" : "📹"}</span>
                    {m === "audio" ? "Audio Only" : "Audio + Video"}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.save_recording}
                onChange={(e) => setForm({ ...form, save_recording: e.target.checked })}
                className="w-4 h-4 accent-rose-500"
              />
              <div>
                <span className="text-sm font-medium">Save to archive</span>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Recording will be available after the session ends.
                </p>
              </div>
            </label>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-950 px-4 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {loading ? "Starting…" : "Go Live"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
