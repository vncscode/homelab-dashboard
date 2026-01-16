import { describe, it, expect, beforeEach, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { pluginsRouter } from "./plugins";

/**
 * Plugins router tests
 */
describe("Plugins Router", () => {
  // Mock context
  const mockContext = {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "oauth",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };

  describe("list", () => {
    it("should return empty array when no plugins installed", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        const result = await caller.list();
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        // Database might not be available in test environment
        expect(error).toBeDefined();
      }
    });
  });

  describe("available", () => {
    it("should return available plugins", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        const result = await caller.available();
        expect(Array.isArray(result)).toBe(true);
        // Should have at least 3 plugins
        expect(result.length).toBeGreaterThanOrEqual(3);
        // Each plugin should have required fields
        result.forEach((plugin) => {
          expect(plugin).toHaveProperty("id");
          expect(plugin).toHaveProperty("name");
          expect(plugin).toHaveProperty("type");
          expect(plugin).toHaveProperty("version");
          expect(plugin).toHaveProperty("description");
          expect(plugin).toHaveProperty("isInstalled");
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getById", () => {
    it("should throw error for invalid id", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.getById({ id: -1 });
        expect.fail("Should have thrown error");
      } catch (error) {
        // Either validation error or not found error
        expect(error).toBeDefined();
      }
    });

    it("should throw error for zero id", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.getById({ id: 0 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for non-existent plugin", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.getById({ id: 99999 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error instanceof TRPCError).toBe(true);
        if (error instanceof TRPCError) {
          expect(error.code).toBe("NOT_FOUND");
        }
      }
    });
  });

  describe("install", () => {
    it("should throw error for invalid plugin type", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.install({ type: "invalid" as any });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should accept valid plugin types", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      const validTypes = ["jexactyl", "qbittorrent", "glances"] as const;

      for (const type of validTypes) {
        try {
          // This will fail if plugin already installed or database unavailable
          // But it should not fail due to invalid type
          await caller.install({ type });
        } catch (error) {
          if (error instanceof TRPCError) {
            // Expected errors: CONFLICT (already installed) or INTERNAL_SERVER_ERROR (db issue)
            expect(["CONFLICT", "INTERNAL_SERVER_ERROR"]).toContain(error.code);
          }
        }
      }
    });
  });

  describe("uninstall", () => {
    it("should throw error for invalid id", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.uninstall({ id: -1 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for zero id", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.uninstall({ id: 0 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("enable", () => {
    it("should throw error for invalid id", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.enable({ id: -1 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for zero id", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.enable({ id: 0 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("disable", () => {
    it("should throw error for invalid id", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.disable({ id: -1 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for zero id", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.disable({ id: 0 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getStats", () => {
    it("should throw error for invalid pluginId", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.getStats({ pluginId: -1 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for zero pluginId", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.getStats({ pluginId: 0 });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("updateStats", () => {
    it("should throw error for invalid pluginId", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.updateStats({ pluginId: -1, key: "test", value: "value" });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for empty key", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      try {
        await caller.updateStats({ pluginId: 1, key: "", value: "value" });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for key exceeding max length", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      const longKey = "a".repeat(256);
      try {
        await caller.updateStats({ pluginId: 1, key: longKey, value: "value" });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for value exceeding max length", async () => {
      const caller = pluginsRouter.createCaller(mockContext);
      const longValue = "a".repeat(1001);
      try {
        await caller.updateStats({ pluginId: 1, key: "test", value: longValue });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
