/**
 * Shared WebSocket event types and interfaces
 */

/**
 * Plugin status event
 */
export interface PluginStatusEvent {
  pluginId: number;
  pluginType: "jexactyl" | "qbittorrent" | "glances";
  isEnabled: boolean;
  isInstalled: boolean;
  timestamp: number;
  message?: string;
}

/**
 * Torrent progress event
 */
export interface TorrentProgressEvent {
  instanceId: number;
  torrentHash: string;
  torrentName: string;
  progress: number; // 0-100
  downloadSpeed: number; // bytes per second
  uploadSpeed: number; // bytes per second
  eta: number; // seconds remaining
  status: "downloading" | "seeding" | "paused" | "stopped" | "error";
  timestamp: number;
  error?: string;
}

/**
 * Server resource metrics event
 */
export interface ServerMetricsEvent {
  instanceId: number;
  cpu: {
    percent: number; // 0-100
    cores: number;
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    percent: number; // 0-100
  };
  disk: {
    used: number; // bytes
    total: number; // bytes
    percent: number; // 0-100
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  timestamp: number;
}

/**
 * Connection status event
 */
export interface ConnectionStatusEvent {
  connected: boolean;
  userId: number;
  timestamp: number;
  message?: string;
}

/**
 * Error event
 */
export interface ErrorEvent {
  code: string;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

/**
 * WebSocket server to client events
 */
export interface ServerToClientEvents {
  "plugin:status": (event: PluginStatusEvent) => void;
  "torrent:progress": (event: TorrentProgressEvent) => void;
  "server:metrics": (event: ServerMetricsEvent) => void;
  "connection:status": (event: ConnectionStatusEvent) => void;
  "error": (event: ErrorEvent) => void;
}

/**
 * WebSocket client to server events
 */
export interface ClientToServerEvents {
  "subscribe:plugins": (userId: number) => void;
  "subscribe:torrents": (instanceId: number) => void;
  "subscribe:metrics": (instanceId: number) => void;
  "unsubscribe:plugins": (userId: number) => void;
  "unsubscribe:torrents": (instanceId: number) => void;
  "unsubscribe:metrics": (instanceId: number) => void;
  "ping": () => void;
}

/**
 * WebSocket socket data
 */
export interface SocketData {
  userId: number;
  subscribedPlugins: Set<number>;
  subscribedTorrents: Set<number>;
  subscribedMetrics: Set<number>;
}
