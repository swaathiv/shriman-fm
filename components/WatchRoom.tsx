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
  host_name: string;
  mode: "audio" | "video";
}

function RoomContent({ session }: { session: Session }) {
  const participants = useParticipants();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs bg-rose-600 text-white px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <div>
            <span className="font-semibold">{session.title}</span>
            <span className="text-zinc-500 text-sm ml-2">by {session.host_name}</span>
          </div>
        </div>
        <span className="text-sm text-zinc-400">{participants.length} watching</span>
      </div>

      <div className="flex-1">
        <VideoConference />
      </div>
    </div>
  );
}

interface Props {
  session: Session;
  token: string;
}

export default function WatchRoom({ session, token }: Props) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      video={false}
      audio={false}
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      <RoomContent session={session} />
    </LiveKitRoom>
  );
}
