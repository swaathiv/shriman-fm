"use client";

import "@livekit/components-styles";
import {
  LiveKitRoom,
  VideoConference,
  useParticipants,
} from "@livekit/components-react";

interface Session {
  id: string;
  title: string;
  livekit_room: string;
  mode: "audio" | "video";
  save_recording: number;
}

interface Props {
  session: Session;
  token: string;
  onEnd: () => void;
}

function RoomContent({ session, onEnd }: { session: Session; onEnd: () => void }) {
  const participants = useParticipants();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs bg-rose-600 text-white px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <span className="font-semibold">{session.title}</span>
          {session.save_recording ? (
            <span className="text-xs text-zinc-500">⏺ Recording</span>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{participants.length} connected</span>
          <button
            onClick={onEnd}
            className="px-4 py-2 text-sm bg-rose-900 hover:bg-rose-800 border border-rose-700 text-rose-300 rounded-lg transition-colors font-medium"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="flex-1">
        <VideoConference />
      </div>
    </div>
  );
}

export default function BroadcastRoom({ session, token, onEnd }: Props) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      video={session.mode === "video"}
      audio={true}
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      <RoomContent session={session} onEnd={onEnd} />
    </LiveKitRoom>
  );
}
