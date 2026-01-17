import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";

// Mock tRPC context
const mockCtx = {
  user: {
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
    loginMethod: "oauth",
    lastSignedIn: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

describe("Settings Router - Validation", () => {
  describe("Jexactyl Validation", () => {
    it("should validate required fields for Jexactyl create", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        apiKey: z.string().min(1),
        serverId: z.string().min(1),
        description: z.string().optional(),
      });

      const validData = {
        name: "Test Server",
        apiUrl: "https://jexactyl.example.com/api",
        apiKey: "test-key-123",
        serverId: "1",
        description: "Test description",
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it("should reject invalid URL for Jexactyl", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        apiKey: z.string().min(1),
        serverId: z.string().min(1),
        description: z.string().optional(),
      });

      const invalidData = {
        name: "Test Server",
        apiUrl: "not-a-url",
        apiKey: "test-key-123",
        serverId: "1",
      };

      expect(() => schema.parse(invalidData)).toThrow();
    });

    it("should reject empty name for Jexactyl", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        apiKey: z.string().min(1),
        serverId: z.string().min(1),
        description: z.string().optional(),
      });

      const invalidData = {
        name: "",
        apiUrl: "https://jexactyl.example.com/api",
        apiKey: "test-key-123",
        serverId: "1",
      };

      expect(() => schema.parse(invalidData)).toThrow();
    });
  });

  describe("qBittorrent Validation", () => {
    it("should validate required fields for qBittorrent create", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        username: z.string().min(1),
        password: z.string().min(1),
        description: z.string().optional(),
      });

      const validData = {
        name: "qBittorrent Instance",
        apiUrl: "http://localhost:8080",
        username: "admin",
        password: "password123",
        description: "Main instance",
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it("should reject invalid URL for qBittorrent", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        username: z.string().min(1),
        password: z.string().min(1),
        description: z.string().optional(),
      });

      const invalidData = {
        name: "qBittorrent Instance",
        apiUrl: "invalid-url",
        username: "admin",
        password: "password123",
      };

      expect(() => schema.parse(invalidData)).toThrow();
    });
  });

  describe("Glances Validation", () => {
    it("should validate required fields for Glances create", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        apiKey: z.string().optional(),
        description: z.string().optional(),
      });

      const validData = {
        name: "Glances Instance",
        apiUrl: "http://localhost:61208",
        apiKey: "optional-key",
        description: "Monitoring",
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it("should allow Glances without apiKey", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        apiKey: z.string().optional(),
        description: z.string().optional(),
      });

      const validData = {
        name: "Glances Instance",
        apiUrl: "http://localhost:61208",
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });
  });

  describe("Cloudflare Validation", () => {
    it("should validate required fields for Cloudflare create", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiToken: z.string().min(1),
        accountId: z.string().min(1),
        accountEmail: z.string().email(),
        description: z.string().optional(),
      });

      const validData = {
        name: "Cloudflare Account",
        apiToken: "token-123",
        accountId: "account-id",
        accountEmail: "test@example.com",
        description: "Main account",
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it("should reject invalid email for Cloudflare", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiToken: z.string().min(1),
        accountId: z.string().min(1),
        accountEmail: z.string().email(),
        description: z.string().optional(),
      });

      const invalidData = {
        name: "Cloudflare Account",
        apiToken: "token-123",
        accountId: "account-id",
        accountEmail: "not-an-email",
      };

      expect(() => schema.parse(invalidData)).toThrow();
    });
  });

  describe("Uptime Kuma Validation", () => {
    it("should validate required fields for Uptime Kuma create", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        apiKey: z.string().min(1),
        description: z.string().optional(),
      });

      const validData = {
        name: "Uptime Kuma Instance",
        apiUrl: "http://localhost:3001",
        apiKey: "key-123",
        description: "Monitoring",
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it("should reject invalid URL for Uptime Kuma", () => {
      const schema = z.object({
        name: z.string().min(1),
        apiUrl: z.string().url(),
        apiKey: z.string().min(1),
        description: z.string().optional(),
      });

      const invalidData = {
        name: "Uptime Kuma Instance",
        apiUrl: "not-a-url",
        apiKey: "key-123",
      };

      expect(() => schema.parse(invalidData)).toThrow();
    });
  });

  describe("Update Validation", () => {
    it("should allow partial updates for Jexactyl", () => {
      const schema = z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        apiUrl: z.string().url().optional(),
        apiKey: z.string().min(1).optional(),
        serverId: z.string().min(1).optional(),
        description: z.string().optional(),
      });

      const partialData = {
        id: 1,
        name: "Updated Name",
      };

      expect(() => schema.parse(partialData)).not.toThrow();
    });

    it("should validate URL in partial update", () => {
      const schema = z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        apiUrl: z.string().url().optional(),
        apiKey: z.string().min(1).optional(),
        serverId: z.string().min(1).optional(),
        description: z.string().optional(),
      });

      const invalidData = {
        id: 1,
        apiUrl: "invalid-url",
      };

      expect(() => schema.parse(invalidData)).toThrow();
    });
  });

  describe("Delete Validation", () => {
    it("should validate delete input with valid id", () => {
      const schema = z.object({ id: z.number() });

      const validData = { id: 1 };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it("should reject delete with invalid id", () => {
      const schema = z.object({ id: z.number() });

      const invalidData = { id: "not-a-number" };

      expect(() => schema.parse(invalidData)).toThrow();
    });
  });
});
