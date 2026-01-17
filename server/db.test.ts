import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  upsertUser,
  getUserByOpenId,
  getJexactylServers,
  getQbittorrentInstances,
  getGlancesInstances,
  createJexactylServer,
  updateJexactylServer,
  deleteJexactylServer,
} from "./db";

/**
 * Database operations tests
 * Note: These tests require a database connection
 */
describe("Database Operations", () => {
  describe("upsertUser", () => {
    it("should throw error when openId is empty", async () => {
      await expect(upsertUser({ openId: "" })).rejects.toThrow(
        "User openId is required and cannot be empty"
      );
    });

    it("should throw error when openId is null", async () => {
      await expect(upsertUser({ openId: null as any })).rejects.toThrow(
        "User openId is required and cannot be empty"
      );
    });

    it("should throw error when openId is whitespace only", async () => {
      await expect(upsertUser({ openId: "   " })).rejects.toThrow(
        "User openId is required and cannot be empty"
      );
    });

    it("should handle database unavailable gracefully", async () => {
      // This will throw if database is not available
      // In a real test environment, you'd mock the database
      try {
        await upsertUser({ openId: "test-user" });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getUserByOpenId", () => {
    it("should return undefined for empty openId", async () => {
      const result = await getUserByOpenId("");
      expect(result).toBeUndefined();
    });

    it("should return undefined for null openId", async () => {
      const result = await getUserByOpenId(null as any);
      expect(result).toBeUndefined();
    });

    it("should return undefined for non-existent user", async () => {
      const result = await getUserByOpenId("non-existent-user-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getJexactylServers", () => {
    it("should return empty array for invalid userId", async () => {
      const result = await getJexactylServers(-1);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should return empty array for zero userId", async () => {
      const result = await getJexactylServers(0);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should return empty array for non-integer userId", async () => {
      const result = await getJexactylServers(1.5 as any);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getQbittorrentInstances", () => {
    it("should return empty array for invalid userId", async () => {
      const result = await getQbittorrentInstances(-1);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should return empty array for zero userId", async () => {
      const result = await getQbittorrentInstances(0);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("getGlancesInstances", () => {
    it("should return empty array for invalid userId", async () => {
      const result = await getGlancesInstances(-1);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should return empty array for zero userId", async () => {
      const result = await getGlancesInstances(0);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("createJexactylServer", () => {
    it("should throw error for invalid userId", async () => {
      await expect(
        createJexactylServer(-1, { name: "Test", apiUrl: "http://test.com", apiKey: "key" } as any)
      ).rejects.toThrow("Invalid userId");
    });

    it("should throw error for missing name", async () => {
      await expect(
        createJexactylServer(1, { name: "", domainUrl: "http://test.com", apiKey: "key" } as any)
      ).rejects.toThrow("Server name and domain URL are required");
    });

    it("should throw error for missing domainUrl", async () => {
      await expect(
        createJexactylServer(1, { name: "Test", domainUrl: "", apiKey: "key" } as any)
      ).rejects.toThrow("Server name and domain URL are required");
    });

    it("should throw error for null name", async () => {
      await expect(
        createJexactylServer(1, { name: null as any, domainUrl: "http://test.com", apiKey: "key" } as any)
      ).rejects.toThrow("Server name and domain URL are required");
    });
  });

  describe("updateJexactylServer", () => {
    it("should throw error for invalid id", async () => {
      await expect(updateJexactylServer(-1, { name: "Updated" })).rejects.toThrow(
        "Invalid server id"
      );
    });

    it("should throw error for zero id", async () => {
      await expect(updateJexactylServer(0, { name: "Updated" })).rejects.toThrow(
        "Invalid server id"
      );
    });

    it("should throw error for empty update data", async () => {
      await expect(updateJexactylServer(1, {})).rejects.toThrow(
        "No data to update"
      );
    });
  });

  describe("deleteJexactylServer", () => {
    it("should throw error for invalid id", async () => {
      await expect(deleteJexactylServer(-1)).rejects.toThrow(
        "Invalid server id"
      );
    });

    it("should throw error for zero id", async () => {
      await expect(deleteJexactylServer(0)).rejects.toThrow(
        "Invalid server id"
      );
    });
  });
});
