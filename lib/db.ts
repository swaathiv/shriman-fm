import { createClient } from "@libsql/client";
import path from "path";

let client: ReturnType<typeof createClient>;
let ready: Promise<void> | null = null;

export function getDb() {
  if (!client) {
    client = createClient({
      url: process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "shirman.db")}`,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    ready = initSchema();
  }
  return client;
}

// Call this at the top of every route handler before querying
export async function ensureDb() {
  getDb();
  if (ready) await ready;
  return client;
}

async function initSchema() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      notify_email INTEGER NOT NULL DEFAULT 1,
      notify_whatsapp INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      host_name TEXT NOT NULL,
      host_email TEXT NOT NULL,
      mode TEXT NOT NULL,
      save_recording INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'live',
      livekit_room TEXT NOT NULL,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT
    );
  `);
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notify_email: number;
  notify_whatsapp: number;
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  host_name: string;
  host_email: string;
  mode: "audio" | "video";
  save_recording: number;
  status: "live" | "ended";
  livekit_room: string;
  started_at: string;
  ended_at: string | null;
}
