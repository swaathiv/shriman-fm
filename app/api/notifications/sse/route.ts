import { addClient, removeClient } from "@/lib/sse";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      addClient(clientId, controller);

      // Send a heartbeat comment every 25s to keep the connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      // Send an initial connected event
      controller.enqueue(
        new TextEncoder().encode(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`)
      );
    },
    cancel() {
      removeClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
