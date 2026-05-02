// Module-level SSE client registry — works for single-process dev/POC
// In production, replace with Redis pub/sub

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const clients = new Map<string, SSEClient>();

export function addClient(id: string, controller: ReadableStreamDefaultController) {
  clients.set(id, { id, controller });
}

export function removeClient(id: string) {
  clients.delete(id);
}

export function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  for (const client of clients.values()) {
    try {
      client.controller.enqueue(encoder.encode(payload));
    } catch {
      clients.delete(client.id);
    }
  }
}
