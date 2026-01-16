import { gte, lte, and, eq } from "drizzle-orm";
import { serverMetricsHistory, torrentDownloadHistory } from "../drizzle/schema";
import type { InsertServerMetricsHistory, InsertTorrentDownloadHistory } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Save server metrics history
 */
export async function saveServerMetricsHistory(
  userId: number,
  instanceId: number,
  data: Omit<InsertServerMetricsHistory, "userId" | "instanceId">
): Promise<void> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save metrics: database not available");
    return;
  }

  try {
    await db.insert(serverMetricsHistory).values({
      userId,
      instanceId,
      ...data,
    });
  } catch (error) {
    console.error("[Database] Failed to save server metrics history:", error);
    throw error;
  }
}

/**
 * Get server metrics history for a specific time range
 */
export async function getServerMetricsHistory(
  userId: number,
  instanceId: number,
  startTime: Date,
  endTime: Date,
  limit: number = 1000
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }
  if (startTime >= endTime) {
    throw new Error("startTime must be before endTime");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot query metrics: database not available");
    return [];
  }

  try {
    const results = await db
      .select()
      .from(serverMetricsHistory)
      .where(
        and(
          eq(serverMetricsHistory.userId, userId),
          eq(serverMetricsHistory.instanceId, instanceId),
          gte(serverMetricsHistory.timestamp, startTime),
          lte(serverMetricsHistory.timestamp, endTime)
        )
      )
      .orderBy(serverMetricsHistory.timestamp)
      .limit(limit);

    return results;
  } catch (error) {
    console.error("[Database] Failed to query server metrics history:", error);
    throw error;
  }
}

/**
 * Save torrent download history
 */
export async function saveTorrentDownloadHistory(
  userId: number,
  instanceId: number,
  data: Omit<InsertTorrentDownloadHistory, "userId" | "instanceId">
): Promise<void> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }
  if (!data.torrentHash || data.torrentHash.trim() === "") {
    throw new Error("Torrent hash is required");
  }
  if (!data.torrentName || data.torrentName.trim() === "") {
    throw new Error("Torrent name is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save torrent history: database not available");
    return;
  }

  try {
    await db.insert(torrentDownloadHistory).values({
      userId,
      instanceId,
      ...data,
    });
  } catch (error) {
    console.error("[Database] Failed to save torrent download history:", error);
    throw error;
  }
}

/**
 * Get torrent download history for a specific torrent
 */
export async function getTorrentDownloadHistory(
  userId: number,
  instanceId: number,
  torrentHash: string,
  startTime: Date,
  endTime: Date,
  limit: number = 1000
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }
  if (!torrentHash || torrentHash.trim() === "") {
    throw new Error("Torrent hash is required");
  }
  if (startTime >= endTime) {
    throw new Error("startTime must be before endTime");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot query torrent history: database not available");
    return [];
  }

  try {
    const results = await db
      .select()
      .from(torrentDownloadHistory)
      .where(
        and(
          eq(torrentDownloadHistory.userId, userId),
          eq(torrentDownloadHistory.instanceId, instanceId),
          eq(torrentDownloadHistory.torrentHash, torrentHash),
          gte(torrentDownloadHistory.timestamp, startTime),
          lte(torrentDownloadHistory.timestamp, endTime)
        )
      )
      .orderBy(torrentDownloadHistory.timestamp)
      .limit(limit);

    return results;
  } catch (error) {
    console.error("[Database] Failed to query torrent download history:", error);
    throw error;
  }
}

/**
 * Get all torrents history for an instance in a time range
 */
export async function getAllTorrentsHistory(
  userId: number,
  instanceId: number,
  startTime: Date,
  endTime: Date,
  limit: number = 5000
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }
  if (startTime >= endTime) {
    throw new Error("startTime must be before endTime");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot query torrents history: database not available");
    return [];
  }

  try {
    const results = await db
      .select()
      .from(torrentDownloadHistory)
      .where(
        and(
          eq(torrentDownloadHistory.userId, userId),
          eq(torrentDownloadHistory.instanceId, instanceId),
          gte(torrentDownloadHistory.timestamp, startTime),
          lte(torrentDownloadHistory.timestamp, endTime)
        )
      )
      .orderBy(torrentDownloadHistory.timestamp)
      .limit(limit);

    return results;
  } catch (error) {
    console.error("[Database] Failed to query all torrents history:", error);
    throw error;
  }
}

/**
 * Delete old metrics history (older than specified date)
 */
export async function deleteOldMetricsHistory(beforeDate: Date): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete old metrics: database not available");
    return 0;
  }

  try {
    await db
      .delete(serverMetricsHistory)
      .where(lte(serverMetricsHistory.timestamp, beforeDate));

    return 1; // Successfully deleted
  } catch (error) {
    console.error("[Database] Failed to delete old metrics history:", error);
    throw error;
  }
}

/**
 * Delete old torrent history (older than specified date)
 */
export async function deleteOldTorrentHistory(beforeDate: Date): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete old torrent history: database not available");
    return 0;
  }

  try {
    await db
      .delete(torrentDownloadHistory)
      .where(lte(torrentDownloadHistory.timestamp, beforeDate));

    return 1; // Successfully deleted
  } catch (error) {
    console.error("[Database] Failed to delete old torrent history:", error);
    throw error;
  }
}
