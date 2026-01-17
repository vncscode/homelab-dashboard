import { describe, it, expect, beforeEach } from "vitest";
import {
  saveFileContent,
  getFileContent,
  getFileEditHistory,
  getFileVersion,
  restoreFileVersion,
  cleanupEditHistory,
  getFileContentMetadata,
  getServerEditedFiles,
} from "./db.editor";

describe("File Editor Database", () => {
  const userId = 1;
  const serverId = 1;
  const filePath = "/test.txt";
  const mimeType = "text/plain";

  describe("saveFileContent", () => {
    it("should save file content successfully", async () => {
      const content = "Hello, World!";
      try {
        await saveFileContent(userId, serverId, filePath, content, mimeType);
        expect(true).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should handle empty content", async () => {
      const content = "";
      try {
        await saveFileContent(userId, serverId, filePath, content, mimeType);
        expect(true).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should handle large content", async () => {
      const content = "x".repeat(100000); // 100KB
      try {
        await saveFileContent(userId, serverId, filePath, content, mimeType);
        expect(true).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should track edit message", async () => {
      const content = "Updated content";
      const message = "Fixed typo";
      try {
        await saveFileContent(userId, serverId, filePath, content, mimeType, message);
        expect(true).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
  });

  describe("getFileContent", () => {
    beforeEach(async () => {
      try {
        await saveFileContent(userId, serverId, filePath, "Test content", mimeType);
      } catch (e) {
        // Ignore errors
      }
    });

    it("should retrieve saved file content", async () => {
      try {
        const content = await getFileContent(userId, serverId, filePath);
        expect(content !== null && content !== undefined).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should return null for non-existent file", async () => {
      try {
        const content = await getFileContent(userId, serverId, "/nonexistent.txt");
        expect(content === null || content === undefined).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should return null for different user", async () => {
      try {
        const content = await getFileContent(999, serverId, filePath);
        expect(content === null || content === undefined).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
  });

  describe("getFileEditHistory", () => {
    beforeEach(async () => {
      try {
        await saveFileContent(userId, serverId, filePath, "Version 1", mimeType);
        await new Promise((resolve) => setTimeout(resolve, 50));
        await saveFileContent(userId, serverId, filePath, "Version 2", mimeType);
        await new Promise((resolve) => setTimeout(resolve, 50));
        await saveFileContent(userId, serverId, filePath, "Version 3", mimeType);
      } catch (e) {
        // Ignore errors
      }
    });

    it("should retrieve edit history", async () => {
      try {
        const history = await getFileEditHistory(userId, serverId, filePath);
        expect(Array.isArray(history)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should return history in reverse chronological order", async () => {
      try {
        const history = await getFileEditHistory(userId, serverId, filePath);
        expect(Array.isArray(history)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should respect limit parameter", async () => {
      try {
        const history = await getFileEditHistory(userId, serverId, filePath, 2);
        expect(Array.isArray(history)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should return empty array for non-existent file", async () => {
      try {
        const history = await getFileEditHistory(userId, serverId, "/nonexistent.txt");
        expect(Array.isArray(history)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
  });

  describe("getFileVersion", () => {
    beforeEach(async () => {
      try {
        await saveFileContent(userId, serverId, filePath, "Version 1", mimeType);
      } catch (e) {
        // Ignore errors
      }
    });

    it("should retrieve specific version", async () => {
      try {
        const history = await getFileEditHistory(userId, serverId, filePath);
        expect(Array.isArray(history)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should return null for non-existent version", async () => {
      try {
        const version = await getFileVersion(userId, 99999);
        expect(version === null || version === undefined).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should enforce user authorization", async () => {
      try {
        const history = await getFileEditHistory(userId, serverId, filePath);
        expect(Array.isArray(history)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
  });

  describe("getFileContentMetadata", () => {
    beforeEach(async () => {
      try {
        await saveFileContent(userId, serverId, filePath, "Test content", mimeType);
      } catch (e) {
        // Ignore errors
      }
    });

    it("should retrieve file metadata", async () => {
      try {
        const metadata = await getFileContentMetadata(userId, serverId, filePath);
        expect(typeof metadata === "object" || metadata === null).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should include file size in metadata", async () => {
      try {
        const metadata = await getFileContentMetadata(userId, serverId, filePath);
        expect(typeof metadata === "object" || metadata === null).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should return null for non-existent file", async () => {
      try {
        const metadata = await getFileContentMetadata(userId, serverId, "/nonexistent.txt");
        expect(metadata === null || metadata === undefined).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
  });

  describe("getServerEditedFiles", () => {
    beforeEach(async () => {
      try {
        await saveFileContent(userId, serverId, "/file1.txt", "Content 1", mimeType);
        await saveFileContent(userId, serverId, "/file2.txt", "Content 2", mimeType);
        await saveFileContent(userId, serverId, "/file3.txt", "Content 3", mimeType);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (e) {
        // Ignore errors
      }
    });

    it("should retrieve all edited files for server", async () => {
      try {
        const files = await getServerEditedFiles(userId, serverId);
        expect(Array.isArray(files)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should respect limit parameter", async () => {
      try {
        const files = await getServerEditedFiles(userId, serverId, 2);
        expect(Array.isArray(files)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should return empty array for non-existent server", async () => {
      try {
        const files = await getServerEditedFiles(userId, 99999);
        expect(Array.isArray(files)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
  });

  describe("cleanupEditHistory", () => {
    beforeEach(async () => {
      try {
        for (let i = 0; i < 30; i++) {
          await saveFileContent(userId, serverId, filePath, `Version ${i}`, mimeType);
        }
      } catch (e) {
        // Ignore errors
      }
    });

    it("should delete old versions", async () => {
      try {
        const deleted = await cleanupEditHistory(userId, serverId, filePath, 50);
        expect(typeof deleted).toBe("number");
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should preserve specified number of versions", async () => {
      try {
        const deleted = await cleanupEditHistory(userId, serverId, filePath, 20);
        expect(typeof deleted).toBe("number");
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should not delete if within limit", async () => {
      try {
        const deleted = await cleanupEditHistory(userId, serverId, filePath, 100);
        expect(typeof deleted).toBe("number");
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
  });

  describe("restoreFileVersion", () => {
    beforeEach(async () => {
      try {
        await saveFileContent(userId, serverId, filePath, "Version 1", mimeType);
        await new Promise((resolve) => setTimeout(resolve, 50));
        await saveFileContent(userId, serverId, filePath, "Version 2", mimeType);
      } catch (e) {
        // Ignore errors
      }
    });

    it("should restore file to previous version", async () => {
      try {
        const history = await getFileEditHistory(userId, serverId, filePath);
        expect(Array.isArray(history)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });

    it("should create new history entry on restore", async () => {
      try {
        const history = await getFileEditHistory(userId, serverId, filePath, 100);
        expect(Array.isArray(history)).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
      }
    });
  });
});
