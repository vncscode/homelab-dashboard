import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createFileUpload,
  updateUploadProgress,
  getFileUpload,
  getUserServerUploads,
  deleteFileUpload,
  getServerFiles,
  getRecentUploads,
  getUploadStats,
  upsertServerFile,
} from "../db.uploads";

export const uploadsRouter = router({
  /**
   * Create a new file upload
   */
  createUpload: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        fileName: z.string().min(1).max(512),
        fileSize: z.number().int().positive(),
        filePath: z.string().min(1).max(1024),
        mimeType: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await createFileUpload({
          userId: ctx.user.id,
          serverId: input.serverId,
          fileName: input.fileName,
          fileSize: input.fileSize,
          filePath: input.filePath,
          mimeType: input.mimeType,
          status: "pending",
          progress: 0,
        });

        return {
          success: true,
          uploadId: (result as any).insertId || 0,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create upload",
        });
      }
    }),

  /**
   * Update upload progress
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        uploadId: z.number().int().positive(),
        progress: z.number().int().min(0).max(100),
        status: z.enum(["pending", "uploading", "completed", "failed"]),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const upload = await getFileUpload(input.uploadId);
        if (!upload) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Upload not found",
          });
        }

        if (upload.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to update this upload",
          });
        }

        await updateUploadProgress(
          input.uploadId,
          input.progress,
          input.status,
          input.errorMessage
        );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update progress",
        });
      }
    }),

  /**
   * Get upload by ID
   */
  getUpload: protectedProcedure
    .input(z.object({ uploadId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      try {
        const upload = await getFileUpload(input.uploadId);
        if (!upload) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Upload not found",
          });
        }

        if (upload.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view this upload",
          });
        }

        return upload;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get upload",
        });
      }
    }),

  /**
   * Get all uploads for a server
   */
  getServerUploads: protectedProcedure
    .input(z.object({ serverId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      try {
        const uploads = await getUserServerUploads(ctx.user.id, input.serverId);
        return uploads;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get uploads",
        });
      }
    }),

  /**
   * Delete upload
   */
  deleteUpload: protectedProcedure
    .input(z.object({ uploadId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await deleteFileUpload(input.uploadId, ctx.user.id);
        return { success: true };
      } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to delete this upload",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to delete upload",
        });
      }
    }),

  /**
   * Get server files for a path
   */
  getServerFiles: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        filePath: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const files = await getServerFiles(ctx.user.id, input.serverId, input.filePath);
        return files;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get server files",
        });
      }
    }),

  /**
   * Get recent uploads
   */
  getRecentUploads: protectedProcedure
    .input(z.object({ limit: z.number().int().positive().max(100).optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const uploads = await getRecentUploads(ctx.user.id, input.limit || 10);
        return uploads;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get recent uploads",
        });
      }
    }),

  /**
   * Get upload statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stats = await getUploadStats(ctx.user.id);
      return stats;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to get upload stats",
      });
    }
  }),
});
