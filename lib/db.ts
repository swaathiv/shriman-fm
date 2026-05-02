import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "shirman.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
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
      mode TEXT NOT NULL CHECK(mode IN ('audio', 'video')),
      save_recording INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'live' CHECK(status IN ('live', 'ended')),
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
