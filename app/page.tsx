"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  id: string;
  title: string;
  host_name: string;
  mode: "audio" | "video";
  started_at: string;
}

export default function Home() {
  const [liveSessions, setLiveSessions] = useState<Session[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Fetch active sessions on load
    fetch("/api/sessions/active")
      .then((r) => r.json())
      .then(setLiveSessions)
      .catch(() => {});

    // Connect to SSE for real-time notifications
    const es = new EventSource("/api/notifications/sse");

    es.addEventListener("session_started", (e) => {
      const session: Session = JSON.parse(e.data);
      setLiveSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);
      setNotification(`🔴 "${session.title}" just went live!`);
      setTimeout(() => setNotification(null), 6000);
    });

    es.addEventListener("session_ended", (e) => {
      const { session_id } = JSON.parse(e.data);
      setLiveSessions((prev) => prev.filter((s) => s.id !== session_id));
    });

    return () => es.close();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Live notification toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-bounce">
          {notification}
        </div>
      )}

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <span className="text-xl font-bold tracking-tight">
          📻 Shirman<span className="text-rose-500">.fm</span>
        </span>
        <div className="flex gap-3">
          <Link
            href="/register"
            className="px-4 py-2 text-sm rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/broadcast"
            className="px-4 py-2 text-sm rounded-lg bg-rose-600 hover:bg-rose-500 transition-colors font-medium"
          >
            Go Live
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Broadcast to your audience,{" "}
            <span className="text-rose-500">live.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Start an audio or video session. Everyone gets notified instantly — in browser, email, and WhatsApp.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/broadcast"
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-semibold transition-colors"
            >
              Start Broadcasting
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 rounded-xl font-semibold transition-colors"
            >
              Get Notified
            </Link>
          </div>
        </div>

        {/* Live sessions */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />
            Live Right Now
          </h2>

          {liveSessions.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
              No active sessions. Be the first to go live.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {liveSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/watch/${session.id}`}
                  className="block border border-zinc-800 hover:border-rose-600 rounded-2xl p-5 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded-full font-medium">
                      LIVE
                    </span>
                    <span className="text-xs text-zinc-500">
                      {session.mode === "video" ? "📹 Video" : "🎙 Audio"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-rose-400 transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">by {session.host_name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
