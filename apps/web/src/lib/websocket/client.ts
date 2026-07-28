// ============================================================
// LifeKit WebSocket Client
// Handles real-time: AI generation progress, task updates,
// mission progress, notifications, marketplace transactions.
// ============================================================

type WSEventType =
  | "ai:generation:progress"
  | "ai:generation:complete"
  | "task:updated"
  | "mission:progress"
  | "notification:new"
  | "transaction:status";

interface WSMessage<T = unknown> {
  event: WSEventType;
  payload: T;
  timestamp: string;
}

type WSEventHandler<T = unknown> = (payload: T) => void;

class LifeKitWSClient {
  private socket: WebSocket | null = null;
  private handlers = new Map<WSEventType, Set<WSEventHandler>>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly baseReconnectDelay = 1000;
  private url: string | null = null;

  connect(url: string): void {
    this.url = url;
    this.createSocket(url);
  }

  private createSocket(url: string): void {
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        console.debug("[WS] Connected to LifeKit real-time server");
      };

      this.socket.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data as string);
          this.dispatch(msg.event, msg.payload);
        } catch {
          console.warn("[WS] Failed to parse message", event.data);
        }
      };

      this.socket.onclose = () => {
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.url || this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = this.baseReconnectDelay * 2 ** this.reconnectAttempts;
    this.reconnectAttempts++;
    setTimeout(() => {
      if (this.url) this.createSocket(this.url);
    }, delay);
  }

  private dispatch(event: WSEventType, payload: unknown): void {
    const set = this.handlers.get(event);
    set?.forEach((h) => h(payload));
  }

  on<T>(event: WSEventType, handler: WSEventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as WSEventHandler);
    // Return unsubscribe
    return () => this.handlers.get(event)?.delete(handler as WSEventHandler);
  }

  send(event: string, payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, payload }));
    }
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.url = null;
  }
}

export const wsClient = new LifeKitWSClient();
