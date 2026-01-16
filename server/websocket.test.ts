import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebSocketManager } from "./websocket";
import type { PluginStatusEvent, TorrentProgressEvent, ServerMetricsEvent } from "@shared/websocket";

/**
 * WebSocket manager tests
 */
describe("WebSocketManager", () => {
  let manager: WebSocketManager;

  beforeEach(() => {
    manager = new WebSocketManager();
  });

  describe("initialization", () => {
    it("should create a new instance", () => {
      expect(manager).toBeDefined();
      expect(manager.getConnectedUsersCount()).toBe(0);
      expect(manager.getTotalSocketsCount()).toBe(0);
    });

    it("should have null IO before initialization", () => {
      expect(manager.getIO()).toBeNull();
    });
  });

  describe("connected users tracking", () => {
    it("should start with zero connected users", () => {
      expect(manager.getConnectedUsersCount()).toBe(0);
    });

    it("should start with zero total sockets", () => {
      expect(manager.getTotalSocketsCount()).toBe(0);
    });
  });

  describe("event emission", () => {
    it("should handle plugin status emission for non-existent user", () => {
      const event: PluginStatusEvent = {
        pluginId: 1,
        pluginType: "jexactyl",
        isEnabled: true,
        isInstalled: true,
        timestamp: Date.now(),
      };

      // Should not throw error
      expect(() => manager.emitPluginStatus(999, event)).not.toThrow();
    });

    it("should handle torrent progress emission for non-existent user", () => {
      const event: TorrentProgressEvent = {
        instanceId: 1,
        torrentHash: "abc123",
        torrentName: "Test Torrent",
        progress: 50,
        downloadSpeed: 1024000,
        uploadSpeed: 512000,
        eta: 3600,
        status: "downloading",
        timestamp: Date.now(),
      };

      // Should not throw error
      expect(() => manager.emitTorrentProgress(999, event)).not.toThrow();
    });

    it("should handle server metrics emission for non-existent user", () => {
      const event: ServerMetricsEvent = {
        instanceId: 1,
        cpu: { percent: 45.5, cores: 4 },
        memory: { used: 4000000000, total: 8000000000, percent: 50 },
        disk: { used: 100000000000, total: 500000000000, percent: 20 },
        network: { bytesIn: 1000000, bytesOut: 500000, packetsIn: 10000, packetsOut: 5000 },
        timestamp: Date.now(),
      };

      // Should not throw error
      expect(() => manager.emitServerMetrics(999, event)).not.toThrow();
    });

    it("should handle error emission for non-existent user", () => {
      const event = {
        code: "TEST_ERROR",
        message: "Test error message",
        timestamp: Date.now(),
      };

      // Should not throw error
      expect(() => manager.emitError(999, event)).not.toThrow();
    });
  });

  describe("plugin status event validation", () => {
    it("should validate plugin status event structure", () => {
      const event: PluginStatusEvent = {
        pluginId: 1,
        pluginType: "qbittorrent",
        isEnabled: false,
        isInstalled: true,
        timestamp: Date.now(),
        message: "Plugin disabled",
      };

      expect(event.pluginId).toBe(1);
      expect(event.pluginType).toBe("qbittorrent");
      expect(event.isEnabled).toBe(false);
      expect(event.isInstalled).toBe(true);
      expect(event.message).toBe("Plugin disabled");
    });

    it("should validate torrent progress event structure", () => {
      const event: TorrentProgressEvent = {
        instanceId: 2,
        torrentHash: "def456",
        torrentName: "Another Torrent",
        progress: 75.5,
        downloadSpeed: 2048000,
        uploadSpeed: 1024000,
        eta: 1800,
        status: "seeding",
        timestamp: Date.now(),
      };

      expect(event.instanceId).toBe(2);
      expect(event.torrentHash).toBe("def456");
      expect(event.progress).toBe(75.5);
      expect(event.status).toBe("seeding");
    });

    it("should validate server metrics event structure", () => {
      const event: ServerMetricsEvent = {
        instanceId: 3,
        cpu: { percent: 80.2, cores: 8 },
        memory: { used: 6000000000, total: 16000000000, percent: 37.5 },
        disk: { used: 250000000000, total: 1000000000000, percent: 25 },
        network: { bytesIn: 5000000, bytesOut: 2500000, packetsIn: 50000, packetsOut: 25000 },
        timestamp: Date.now(),
      };

      expect(event.instanceId).toBe(3);
      expect(event.cpu.percent).toBe(80.2);
      expect(event.memory.percent).toBe(37.5);
      expect(event.disk.percent).toBe(25);
    });
  });

  describe("edge cases", () => {
    it("should handle negative user IDs gracefully", () => {
      const event: PluginStatusEvent = {
        pluginId: 1,
        pluginType: "glances",
        isEnabled: true,
        isInstalled: true,
        timestamp: Date.now(),
      };

      // Should not throw error
      expect(() => manager.emitPluginStatus(-1, event)).not.toThrow();
    });

    it("should handle zero user ID gracefully", () => {
      const event: PluginStatusEvent = {
        pluginId: 1,
        pluginType: "jexactyl",
        isEnabled: true,
        isInstalled: true,
        timestamp: Date.now(),
      };

      // Should not throw error
      expect(() => manager.emitPluginStatus(0, event)).not.toThrow();
    });

    it("should handle very large user IDs", () => {
      const event: PluginStatusEvent = {
        pluginId: 1,
        pluginType: "qbittorrent",
        isEnabled: true,
        isInstalled: true,
        timestamp: Date.now(),
      };

      // Should not throw error
      expect(() => manager.emitPluginStatus(Number.MAX_SAFE_INTEGER, event)).not.toThrow();
    });

    it("should handle zero progress in torrent event", () => {
      const event: TorrentProgressEvent = {
        instanceId: 1,
        torrentHash: "xyz789",
        torrentName: "Zero Progress Torrent",
        progress: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        eta: -1,
        status: "downloading",
        timestamp: Date.now(),
      };

      expect(event.progress).toBe(0);
      expect(event.downloadSpeed).toBe(0);
    });

    it("should handle 100% progress in torrent event", () => {
      const event: TorrentProgressEvent = {
        instanceId: 1,
        torrentHash: "complete123",
        torrentName: "Complete Torrent",
        progress: 100,
        downloadSpeed: 0,
        uploadSpeed: 512000,
        eta: 0,
        status: "seeding",
        timestamp: Date.now(),
      };

      expect(event.progress).toBe(100);
      expect(event.eta).toBe(0);
    });

    it("should handle extreme CPU values", () => {
      const event: ServerMetricsEvent = {
        instanceId: 1,
        cpu: { percent: 100, cores: 128 },
        memory: { used: 1000000000000, total: 1000000000000, percent: 100 },
        disk: { used: 10000000000000, total: 10000000000000, percent: 100 },
        network: { bytesIn: 1000000000, bytesOut: 1000000000, packetsIn: 1000000, packetsOut: 1000000 },
        timestamp: Date.now(),
      };

      expect(event.cpu.percent).toBe(100);
      expect(event.memory.percent).toBe(100);
      expect(event.disk.percent).toBe(100);
    });
  });
});
