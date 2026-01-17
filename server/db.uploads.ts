import { eq, and } from "drizzle-orm";
import { fileUploads, serverFiles, InsertFileUpload, InsertServerFile } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new file upload record
 */
export async function createFileUpload(upload: InsertFileUpload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!upload.userId || !upload.serverId || !upload.fileName) {
    throw new Error("Missing required fields: userId, serverId, fileName");
  }

  const result = await db.insert(fileUploads).values(upload);
  return result;
}

/**
 * Update file upload progress
 */
export async function updateUploadProgress(
  uploadId: number,
  progress: number,
  status: "pending" | "uploading" | "completed" | "failed",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (progress < 0 || progress > 100) {
    throw new Error("Progress must be between 0 and 100");
  }

  const updateData: Record<string, unknown> = {
    progress,
    status,
    updatedAt: new Date(),
  };

  if (status === "completed") {
    updateData.uploadedAt = new Date();
  }

  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  await db.update(fileUploads).set(updateData).where(eq(fileUploads.id, uploadId));
}

/**
 * Get file upload by ID
 */
export async function getFileUpload(uploadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(fileUploads)
    .where(eq(fileUploads.id, uploadId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get all uploads for a user and server
 */
export async function getUserServerUploads(userId: number, serverId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!userId || !serverId) {
    throw new Error("Missing required fields: userId, serverId");
  }

  const result = await db
    .select()
    .from(fileUploads)
    .where(and(eq(fileUploads.userId, userId), eq(fileUploads.serverId, serverId)))
    .orderBy(fileUploads.createdAt);

  return result;
}

/**
 * Delete file upload record
 */
export async function deleteFileUpload(uploadId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const upload = await getFileUpload(uploadId);
  if (!upload) throw new Error("Upload not found");
  if (upload.userId !== userId) throw new Error("Unauthorized");

  await db.delete(fileUploads).where(eq(fileUploads.id, uploadId));
}

/**
 * Create or update server file record
 */
export async function upsertServerFile(file: InsertServerFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!file.userId || !file.serverId || !file.fileName || !file.filePath) {
    throw new Error("Missing required fields");
  }

  const existing = await db
    .select()
    .from(serverFiles)
    .where(
      and(
        eq(serverFiles.userId, file.userId),
        eq(serverFiles.serverId, file.serverId),
        eq(serverFiles.filePath, file.filePath)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(serverFiles)
      .set({
        ...file,
        updatedAt: new Date(),
      })
      .where(eq(serverFiles.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(serverFiles).values(file);
    return (result as any).insertId || 0;
  }
}

/**
 * Get server files for a path
 */
export async function getServerFiles(userId: number, serverId: number, filePath: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!userId || !serverId || !filePath) {
    throw new Error("Missing required fields");
  }

  const result = await db
    .select()
    .from(serverFiles)
    .where(
      and(
        eq(serverFiles.userId, userId),
        eq(serverFiles.serverId, serverId),
        eq(serverFiles.filePath, filePath)
      )
    )
    .orderBy(serverFiles.fileName);

  return result;
}

/**
 * Delete server file record
 */
export async function deleteServerFile(fileId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const file = await db
    .select()
    .from(serverFiles)
    .where(eq(serverFiles.id, fileId))
    .limit(1);

  if (file.length === 0) throw new Error("File not found");
  if (file[0].userId !== userId) throw new Error("Unauthorized");

  await db.delete(serverFiles).where(eq(serverFiles.id, fileId));
}

/**
 * Get recent uploads for a user
 */
export async function getRecentUploads(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!userId) {
    throw new Error("Missing required field: userId");
  }

  const result = await db
    .select()
    .from(fileUploads)
    .where(eq(fileUploads.userId, userId))
    .orderBy(fileUploads.createdAt)
    .limit(limit);

  return result;
}

/**
 * Get upload statistics for a user
 */
export async function getUploadStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!userId) {
    throw new Error("Missing required field: userId");
  }

  const uploads = await db
    .select()
    .from(fileUploads)
    .where(eq(fileUploads.userId, userId));

  const totalSize = uploads.reduce((acc, u) => acc + u.fileSize, 0);
  const completed = uploads.filter((u) => u.status === "completed").length;
  const failed = uploads.filter((u) => u.status === "failed").length;
  const pending = uploads.filter((u) => u.status === "pending" || u.status === "uploading").length;

  return {
    totalUploads: uploads.length,
    totalSize,
    completed,
    failed,
    pending,
    averageFileSize: uploads.length > 0 ? totalSize / uploads.length : 0,
  };
}

/**
 * Clean up old uploads (older than 30 days)
 */
export async function cleanupOldUploads(daysOld: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(fileUploads)
    .where(
      and(
        eq(fileUploads.status, "completed"),
        // @ts-ignore - comparing dates
        fileUploads.createdAt < cutoffDate
      )
    );

  return result;
}
