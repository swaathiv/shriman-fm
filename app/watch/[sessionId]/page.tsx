"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import WatchRoom from "@/components/WatchRoom";

interface Session {
  id: string;
  title: string;
  host_name: string;
  mode: "audio" | "video";
  status: "live" | "ended";
}

interface StoredUser {
  name: string;
  email: string;
}

export default function WatchPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [guestName, setGuestName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("shirman_user");
    if (stored) setUser(JSON.parse(stored));

    fetch(`/api/sessions/${sessionId}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setSession(data); })
      .catch(() => setNotFound(true));
  }, [sessionId]);

  async function join(name: string) {
    setJoining(true);
    setError("");
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          participant_name: name,
          is_broadcaster: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      setToken(data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Session not found.</p>
        <Link href="/" className="text-rose-400 hover:underline text-sm">← Back to home</Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-3xl">📭</p>
        <h2 className="text-xl font-semibold">Session has ended</h2>
        <p className="text-zinc-400 text-sm">"{session.title}" is no longer live.</p>
        <Link href="/" className="text-rose-400 hover:underline text-sm">← Back to home</Link>
      </div>
    );
  }

  if (token && session) {
    return <WatchRoom session={session} token={token} />;
  }

  // Join screen
  const autoName = user?.name;
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center px-6 py-4 border-b border-zinc-800">
        <Link href="/" className="text-xl font-bold tracking-tight">
          📻 Shirman<span className="text-rose-500">.fm</span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <span className="inline-flex items-center gap-1.5 text-xs bg-rose-600 text-white px-3 py-1 rounded-full font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE NOW
          </span>
          <h1 className="text-2xl font-bold mb-1">{session.title}</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Hosted by {session.host_name} · {session.mode === "video" ? "📹 Video" : "🎙 Audio"}
          </p>

          {autoName ? (
            <>
              <p className="text-sm text-zinc-400 mb-4">Joining as <strong>{autoName}</strong></p>
              <button
                onClick={() => join(autoName)}
                disabled={joining}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl font-semibold transition-colors"
              >
                {joining ? "Joining…" : "Join Session"}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Your name to join"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-rose-500 focus:outline-none transition-colors mb-3"
              />
              <button
                onClick={() => guestName.trim() && join(guestName.trim())}
                disabled={joining || !guestName.trim()}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl font-semibold transition-colors"
              >
                {joining ? "Joining…" : "Join as Guest"}
              </button>
            </>
          )}

          {error && (
            <p className="mt-3 text-sm text-rose-400">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
