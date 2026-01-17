import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { fileEditHistory, fileContent, InsertFileEditHistory, InsertFileContent } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Save file content and create edit history
 */
export async function saveFileContent(
  userId: number,
  serverId: number,
  filePath: string,
  content: string,
  mimeType: string,
  editMessage?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get previous content
    const existing = await db
      .select()
      .from(fileContent)
      .where(
        and(
          eq(fileContent.userId, userId),
          eq(fileContent.serverId, serverId),
          eq(fileContent.filePath, filePath)
        )
      )
      .limit(1);

    const previousContent = existing.length > 0 ? existing[0].content : null;
    const changeSize = content.length - (previousContent?.length || 0);

    // Save to edit history
    await db.insert(fileEditHistory).values({
      userId,
      serverId,
      filePath,
      content,
      previousContent,
      changeSize,
      editMessage: editMessage || null,
    } as InsertFileEditHistory);

    // Update or insert file content
    if (existing.length > 0) {
      await db
        .update(fileContent)
        .set({
          content,
          fileSize: content.length,
          lastEditedBy: userId,
          lastEditedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(fileContent.userId, userId),
            eq(fileContent.serverId, serverId),
            eq(fileContent.filePath, filePath)
          )
        );
    } else {
      await db.insert(fileContent).values({
        userId,
        serverId,
        filePath,
        content,
        fileSize: content.length,
        mimeType,
        lastEditedBy: userId,
        lastEditedAt: new Date(),
      } as InsertFileContent);
    }
  } catch (error) {
    console.error("[Database] Failed to save file content:", error);
    throw error;
  }
}

/**
 * Get current file content
 */
export async function getFileContent(
  userId: number,
  serverId: number,
  filePath: string
): Promise<string | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(fileContent)
      .where(
        and(
          eq(fileContent.userId, userId),
          eq(fileContent.serverId, serverId),
          eq(fileContent.filePath, filePath)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0].content : null;
  } catch (error) {
    console.error("[Database] Failed to get file content:", error);
    throw error;
  }
}

/**
 * Get file edit history
 */
export async function getFileEditHistory(
  userId: number,
  serverId: number,
  filePath: string,
  limit: number = 20
): Promise<typeof fileEditHistory.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    return await db
      .select()
      .from(fileEditHistory)
      .where(
        and(
          eq(fileEditHistory.userId, userId),
          eq(fileEditHistory.serverId, serverId),
          eq(fileEditHistory.filePath, filePath)
        )
      )
      .orderBy(desc(fileEditHistory.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get edit history:", error);
    throw error;
  }
}

/**
 * Get specific version from history
 */
export async function getFileVersion(
  userId: number,
  historyId: number
): Promise<typeof fileEditHistory.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(fileEditHistory)
      .where(
        and(
          eq(fileEditHistory.id, historyId),
          eq(fileEditHistory.userId, userId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get file version:", error);
    throw error;
  }
}

/**
 * Restore file to previous version
 */
export async function restoreFileVersion(
  userId: number,
  serverId: number,
  filePath: string,
  historyId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get the version to restore
    const version = await getFileVersion(userId, historyId);
    if (!version) throw new Error("Version not found");

    // Save current as new history entry
    await saveFileContent(
      userId,
      serverId,
      filePath,
      version.content,
      "text/plain",
      `Restored from version ${historyId}`
    );
  } catch (error) {
    console.error("[Database] Failed to restore file version:", error);
    throw error;
  }
}

/**
 * Delete old edit history (keep last N versions)
 */
export async function cleanupEditHistory(
  userId: number,
  serverId: number,
  filePath: string,
  keepVersions: number = 50
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get all versions for this file
    const allVersions = await db
      .select({ id: fileEditHistory.id })
      .from(fileEditHistory)
      .where(
        and(
          eq(fileEditHistory.userId, userId),
          eq(fileEditHistory.serverId, serverId),
          eq(fileEditHistory.filePath, filePath)
        )
      )
      .orderBy(desc(fileEditHistory.createdAt));

    if (allVersions.length <= keepVersions) {
      return 0;
    }

    // Delete old versions
    const toDelete = allVersions.slice(keepVersions);
    const deleteCount = toDelete.length;

    for (const version of toDelete) {
      await db
        .delete(fileEditHistory)
        .where(eq(fileEditHistory.id, version.id));
    }

    return deleteCount;
  } catch (error) {
    console.error("[Database] Failed to cleanup edit history:", error);
    throw error;
  }
}

/**
 * Get file content metadata
 */
export async function getFileContentMetadata(
  userId: number,
  serverId: number,
  filePath: string
): Promise<typeof fileContent.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(fileContent)
      .where(
        and(
          eq(fileContent.userId, userId),
          eq(fileContent.serverId, serverId),
          eq(fileContent.filePath, filePath)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get file metadata:", error);
    throw error;
  }
}

/**
 * Get all edited files for a server
 */
export async function getServerEditedFiles(
  userId: number,
  serverId: number,
  limit: number = 100
): Promise<typeof fileContent.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    return await db
      .select()
      .from(fileContent)
      .where(
        and(
          eq(fileContent.userId, userId),
          eq(fileContent.serverId, serverId)
        )
      )
      .orderBy(desc(fileContent.updatedAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get server edited files:", error);
    throw error;
  }
}
