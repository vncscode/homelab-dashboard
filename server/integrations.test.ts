import { describe, it, expect, vi, beforeEach } from "vitest";
import { JexactylClient } from "./integrations/jexactyl";
import { QbittorrentClient } from "./integrations/qbittorrent";
import { GlancesClient } from "./integrations/glances";

describe("Jexactyl Client", () => {
  let client: JexactylClient;

  beforeEach(() => {
    client = new JexactylClient("http://localhost:8080", "test-api-key", "test-server-id");
  });

  it("should initialize with correct credentials", () => {
    expect(client).toBeDefined();
  });

  it("should have sendCommand method", () => {
    expect(client.sendCommand).toBeDefined();
  });

  it("should have startServer method", () => {
    expect(client.startServer).toBeDefined();
  });

  it("should have stopServer method", () => {
    expect(client.stopServer).toBeDefined();
  });

  it("should have restartServer method", () => {
    expect(client.restartServer).toBeDefined();
  });

  it("should have listFiles method", () => {
    expect(client.listFiles).toBeDefined();
  });

  it("should have getFileContents method", () => {
    expect(client.getFileContents).toBeDefined();
  });

  it("should have writeFileContents method", () => {
    expect(client.writeFileContents).toBeDefined();
  });

  it("should have deleteFile method", () => {
    expect(client.deleteFile).toBeDefined();
  });
});

describe("qBittorrent Client", () => {
  let client: QbittorrentClient;

  beforeEach(() => {
    client = new QbittorrentClient({
      url: "http://localhost:6800",
      username: "admin",
      password: "admin",
    });
  });

  it("should initialize with correct credentials", () => {
    expect(client).toBeDefined();
  });

  it("should have listTorrents method", () => {
    expect(client.listTorrents).toBeDefined();
  });

  it("should have getTorrentDetails method", () => {
    expect(client.getTorrentDetails).toBeDefined();
  });

  it("should have addTorrent method", () => {
    expect(client.addTorrent).toBeDefined();
  });

  it("should have pauseTorrent method", () => {
    expect(client.pauseTorrent).toBeDefined();
  });

  it("should have resumeTorrent method", () => {
    expect(client.resumeTorrent).toBeDefined();
  });

  it("should have removeTorrent method", () => {
    expect(client.removeTorrent).toBeDefined();
  });

  it("should have getPreferences method", () => {
    expect(client.getPreferences).toBeDefined();
  });

  it("should have setPreferences method", () => {
    expect(client.setPreferences).toBeDefined();
  });
});

describe("Glances Client", () => {
  let client: GlancesClient;

  beforeEach(() => {
    client = new GlancesClient("http://localhost:61208");
  });

  it("should initialize with correct URL", () => {
    expect(client).toBeDefined();
  });

  it("should have getStatus method", () => {
    expect(client.getStatus).toBeDefined();
  });

  it("should have getAllData method", () => {
    expect(client.getAllData).toBeDefined();
  });

  it("should have getCPU method", () => {
    expect(client.getCPU).toBeDefined();
  });

  it("should have getMemory method", () => {
    expect(client.getMemory).toBeDefined();
  });

  it("should have getDisks method", () => {
    expect(client.getDisks).toBeDefined();
  });

  it("should have getNetwork method", () => {
    expect(client.getNetwork).toBeDefined();
  });

  it("should have getProcesses method", () => {
    expect(client.getProcesses).toBeDefined();
  });

  it("should have getProcessesSorted method", () => {
    expect(client.getProcessesSorted).toBeDefined();
  });
});
