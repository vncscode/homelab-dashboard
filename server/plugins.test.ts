import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("plugins router", () => {
  it("should list plugins for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plugins = await caller.plugins.list();
    expect(Array.isArray(plugins)).toBe(true);
  });

  it("should return available plugins", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const available = await caller.plugins.available();
    expect(Array.isArray(available)).toBe(true);
    expect(available.length).toBeGreaterThan(0);
    expect(available.some(p => p.type === "jexactyl")).toBe(true);
    expect(available.some(p => p.type === "qbittorrent")).toBe(true);
    expect(available.some(p => p.type === "glances")).toBe(true);
  });

  it("should have required properties in available plugins", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const available = await caller.plugins.available();
    available.forEach(plugin => {
      expect(plugin).toHaveProperty("id");
      expect(plugin).toHaveProperty("name");
      expect(plugin).toHaveProperty("type");
      expect(plugin).toHaveProperty("version");
      expect(plugin).toHaveProperty("description");
      expect(plugin).toHaveProperty("icon");
      expect(plugin).toHaveProperty("color");
      expect(plugin).toHaveProperty("isInstalled");
    });
  });
});

describe("settings router", () => {
  it("should list jexactyl servers", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const servers = await caller.settings.jexactyl.list();
    expect(Array.isArray(servers)).toBe(true);
  });

  it("should list qbittorrent instances", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const instances = await caller.settings.qbittorrent.list();
    expect(Array.isArray(instances)).toBe(true);
  });

  it("should list glances instances", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const instances = await caller.settings.glances.list();
    expect(Array.isArray(instances)).toBe(true);
  });
});
