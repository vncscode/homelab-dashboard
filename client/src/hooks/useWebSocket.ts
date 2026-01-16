import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PluginStatusEvent,
  TorrentProgressEvent,
  ServerMetricsEvent,
  ConnectionStatusEvent,
  ErrorEvent,
} from "@shared/websocket";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Hook for WebSocket connection and event handling
 */
export function useWebSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    if (!user?.id) return;

    // Create socket connection
    const socket = io({
      auth: {
        userId: user.id,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      setIsConnected(true);
      setError(null);
    });

    socket.on("connection:status", (event: ConnectionStatusEvent) => {
      console.log("[WebSocket] Connection status:", event);
      setIsConnected(event.connected);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
    });

    socket.on("error", (event: ErrorEvent) => {
      console.error("[WebSocket] Error:", event);
      setError(event.message);
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
      setError(error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  /**
   * Subscribe to plugin status updates
   */
  const subscribeToPlugins = useCallback((pluginId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe:plugins", pluginId);
    }
  }, []);

  /**
   * Unsubscribe from plugin status updates
   */
  const unsubscribeFromPlugins = useCallback((pluginId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("unsubscribe:plugins", pluginId);
    }
  }, []);

  /**
   * Subscribe to torrent progress updates
   */
  const subscribeToTorrents = useCallback((instanceId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe:torrents", instanceId);
    }
  }, []);

  /**
   * Unsubscribe from torrent progress updates
   */
  const unsubscribeFromTorrents = useCallback((instanceId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("unsubscribe:torrents", instanceId);
    }
  }, []);

  /**
   * Subscribe to server metrics updates
   */
  const subscribeToMetrics = useCallback((instanceId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe:metrics", instanceId);
    }
  }, []);

  /**
   * Unsubscribe from server metrics updates
   */
  const unsubscribeFromMetrics = useCallback((instanceId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("unsubscribe:metrics", instanceId);
    }
  }, []);

  /**
   * Listen for plugin status events
   */
  const onPluginStatus = useCallback((callback: (event: PluginStatusEvent) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on("plugin:status", callback);
    return () => {
      socketRef.current?.off("plugin:status", callback);
    };
  }, []);

  /**
   * Listen for torrent progress events
   */
  const onTorrentProgress = useCallback((callback: (event: TorrentProgressEvent) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on("torrent:progress", callback);
    return () => {
      socketRef.current?.off("torrent:progress", callback);
    };
  }, []);

  /**
   * Listen for server metrics events
   */
  const onServerMetrics = useCallback((callback: (event: ServerMetricsEvent) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on("server:metrics", callback);
    return () => {
      socketRef.current?.off("server:metrics", callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    subscribeToPlugins,
    unsubscribeFromPlugins,
    subscribeToTorrents,
    unsubscribeFromTorrents,
    subscribeToMetrics,
    unsubscribeFromMetrics,
    onPluginStatus,
    onTorrentProgress,
    onServerMetrics,
  };
}

/**
 * Hook for plugin status updates
 */
export function usePluginStatus(pluginId: number, onStatusChange?: (event: PluginStatusEvent) => void) {
  const { subscribeToPlugins, unsubscribeFromPlugins, onPluginStatus } = useWebSocket();
  const [status, setStatus] = useState<PluginStatusEvent | null>(null);

  useEffect(() => {
    subscribeToPlugins(pluginId);

    const unsubscribe = onPluginStatus((event) => {
      if (event.pluginId === pluginId) {
        setStatus(event);
        onStatusChange?.(event);
      }
    });

    return () => {
      unsubscribeFromPlugins(pluginId);
      unsubscribe?.();
    };
  }, [pluginId, subscribeToPlugins, unsubscribeFromPlugins, onPluginStatus, onStatusChange]);

  return status;
}

/**
 * Hook for torrent progress updates
 */
export function useTorrentProgress(instanceId: number, onProgressChange?: (event: TorrentProgressEvent) => void) {
  const { subscribeToTorrents, unsubscribeFromTorrents, onTorrentProgress } = useWebSocket();
  const [torrents, setTorrents] = useState<Map<string, TorrentProgressEvent>>(new Map());

  useEffect(() => {
    subscribeToTorrents(instanceId);

    const unsubscribe = onTorrentProgress((event) => {
      if (event.instanceId === instanceId) {
        setTorrents((prev) => {
          const next = new Map(prev);
          next.set(event.torrentHash, event);
          return next;
        });
        onProgressChange?.(event);
      }
    });

    return () => {
      unsubscribeFromTorrents(instanceId);
      unsubscribe?.();
    };
  }, [instanceId, subscribeToTorrents, unsubscribeFromTorrents, onTorrentProgress, onProgressChange]);

  return Array.from(torrents.values());
}

/**
 * Hook for server metrics updates
 */
export function useServerMetrics(instanceId: number, onMetricsChange?: (event: ServerMetricsEvent) => void) {
  const { subscribeToMetrics, unsubscribeFromMetrics, onServerMetrics } = useWebSocket();
  const [metrics, setMetrics] = useState<ServerMetricsEvent | null>(null);

  useEffect(() => {
    subscribeToMetrics(instanceId);

    const unsubscribe = onServerMetrics((event) => {
      if (event.instanceId === instanceId) {
        setMetrics(event);
        onMetricsChange?.(event);
      }
    });

    return () => {
      unsubscribeFromMetrics(instanceId);
      unsubscribe?.();
    };
  }, [instanceId, subscribeToMetrics, unsubscribeFromMetrics, onServerMetrics, onMetricsChange]);

  return metrics;
}
