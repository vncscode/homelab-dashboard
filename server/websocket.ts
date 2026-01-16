import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  PluginStatusEvent,
  TorrentProgressEvent,
  ServerMetricsEvent,
  ConnectionStatusEvent,
  ErrorEvent,
} from "../shared/websocket";

/**
 * WebSocket server manager
 */
export class WebSocketManager {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, any, SocketData> | null = null;
  private userSockets: Map<number, Set<string>> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === "production" ? undefined : "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log("[WebSocket] Server initialized");
    return this.io;
  }

  /**
   * Setup middleware for authentication and logging
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use((socket, next) => {
      try {
        // Extract user ID from socket handshake
        const userId = socket.handshake.auth.userId || socket.handshake.query.userId;

        if (!userId) {
          return next(new Error("Authentication error: userId required"));
        }

        // Store user ID in socket data
        socket.data.userId = parseInt(userId as string, 10);
        socket.data.subscribedPlugins = new Set();
        socket.data.subscribedTorrents = new Set();
        socket.data.subscribedMetrics = new Set();

        // Track socket connection
        if (!this.userSockets.has(socket.data.userId)) {
          this.userSockets.set(socket.data.userId, new Set());
        }
        this.userSockets.get(socket.data.userId)!.add(socket.id);

        console.log(`[WebSocket] User ${socket.data.userId} connected (${socket.id})`);
        next();
      } catch (error) {
        console.error("[WebSocket] Middleware error:", error);
        next(new Error("Authentication error"));
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents, any, SocketData>) => {
      const userId = socket.data.userId;

      // Send connection status
      socket.emit("connection:status", {
        connected: true,
        userId,
        timestamp: Date.now(),
        message: "Connected to WebSocket server",
      } as ConnectionStatusEvent);

      // Handle plugin subscriptions
      socket.on("subscribe:plugins", (id: number) => {
        socket.data.subscribedPlugins.add(id);
        console.log(`[WebSocket] User ${userId} subscribed to plugin ${id}`);
      });

      socket.on("unsubscribe:plugins", (id: number) => {
        socket.data.subscribedPlugins.delete(id);
        console.log(`[WebSocket] User ${userId} unsubscribed from plugin ${id}`);
      });

      // Handle torrent subscriptions
      socket.on("subscribe:torrents", (instanceId: number) => {
        socket.data.subscribedTorrents.add(instanceId);
        console.log(`[WebSocket] User ${userId} subscribed to torrents instance ${instanceId}`);
      });

      socket.on("unsubscribe:torrents", (instanceId: number) => {
        socket.data.subscribedTorrents.delete(instanceId);
        console.log(`[WebSocket] User ${userId} unsubscribed from torrents instance ${instanceId}`);
      });

      // Handle metrics subscriptions
      socket.on("subscribe:metrics", (instanceId: number) => {
        socket.data.subscribedMetrics.add(instanceId);
        console.log(`[WebSocket] User ${userId} subscribed to metrics instance ${instanceId}`);
      });

      socket.on("unsubscribe:metrics", (instanceId: number) => {
        socket.data.subscribedMetrics.delete(instanceId);
        console.log(`[WebSocket] User ${userId} unsubscribed from metrics instance ${instanceId}`);
      });

      // Handle ping
      socket.on("ping", () => {
        socket.emit("connection:status", {
          connected: true,
          userId,
          timestamp: Date.now(),
        } as ConnectionStatusEvent);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        const userSocketIds = this.userSockets.get(userId);
        if (userSocketIds) {
          userSocketIds.delete(socket.id);
          if (userSocketIds.size === 0) {
            this.userSockets.delete(userId);
          }
        }
        console.log(`[WebSocket] User ${userId} disconnected (${socket.id})`);
      });

      // Handle errors
      socket.on("error", (error) => {
        console.error(`[WebSocket] Socket error for user ${userId}:`, error);
      });
    });
  }

  /**
   * Emit plugin status event to user
   */
  emitPluginStatus(userId: number, event: PluginStatusEvent): void {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds || !this.io) return;

    socketIds.forEach((socketId) => {
      const socket = this.io!.sockets.sockets.get(socketId);
      if (socket && socket.data.subscribedPlugins.has(event.pluginId)) {
        socket.emit("plugin:status", event);
      }
    });
  }

  /**
   * Emit torrent progress event to user
   */
  emitTorrentProgress(userId: number, event: TorrentProgressEvent): void {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds || !this.io) return;

    socketIds.forEach((socketId) => {
      const socket = this.io!.sockets.sockets.get(socketId);
      if (socket && socket.data.subscribedTorrents.has(event.instanceId)) {
        socket.emit("torrent:progress", event);
      }
    });
  }

  /**
   * Emit server metrics event to user
   */
  emitServerMetrics(userId: number, event: ServerMetricsEvent): void {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds || !this.io) return;

    socketIds.forEach((socketId) => {
      const socket = this.io!.sockets.sockets.get(socketId);
      if (socket && socket.data.subscribedMetrics.has(event.instanceId)) {
        socket.emit("server:metrics", event);
      }
    });
  }

  /**
   * Emit error event to user
   */
  emitError(userId: number, event: ErrorEvent): void {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds || !this.io) return;

    socketIds.forEach((socketId) => {
      const socket = this.io!.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit("error", event);
      }
    });
  }

  /**
   * Get IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get total connected sockets count
   */
  getTotalSocketsCount(): number {
    let total = 0;
    this.userSockets.forEach((socketIds) => {
      total += socketIds.size;
    });
    return total;
  }
}

/**
 * Global WebSocket manager instance
 */
export const wsManager = new WebSocketManager();
