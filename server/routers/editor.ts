import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  saveFileContent,
  getFileContent,
  getFileEditHistory,
  getFileVersion,
  restoreFileVersion,
  cleanupEditHistory,
  getFileContentMetadata,
  getServerEditedFiles,
} from "../db.editor";

export const editorRouter = router({
  /**
   * Save file content
   */
  saveFile: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        filePath: z.string().min(1).max(1024),
        content: z.string().max(10 * 1024 * 1024), // 10MB max
        mimeType: z.string().min(1).max(255),
        editMessage: z.string().max(512).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await saveFileContent(
          ctx.user.id,
          input.serverId,
          input.filePath,
          input.content,
          input.mimeType,
          input.editMessage
        );

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to save file",
        });
      }
    }),

  /**
   * Get file content
   */
  getFile: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        filePath: z.string().min(1).max(1024),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const content = await getFileContent(
          ctx.user.id,
          input.serverId,
          input.filePath
        );

        if (!content) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found",
          });
        }

        return { content };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get file",
        });
      }
    }),

  /**
   * Get file edit history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        filePath: z.string().min(1).max(1024),
        limit: z.number().int().positive().max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const history = await getFileEditHistory(
          ctx.user.id,
          input.serverId,
          input.filePath,
          input.limit || 20
        );

        return history;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get history",
        });
      }
    }),

  /**
   * Get specific version
   */
  getVersion: protectedProcedure
    .input(z.object({ historyId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      try {
        const version = await getFileVersion(ctx.user.id, input.historyId);

        if (!version) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Version not found",
          });
        }

        return version;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get version",
        });
      }
    }),

  /**
   * Restore file to previous version
   */
  restoreVersion: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        filePath: z.string().min(1).max(1024),
        historyId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await restoreFileVersion(
          ctx.user.id,
          input.serverId,
          input.filePath,
          input.historyId
        );

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to restore version",
        });
      }
    }),

  /**
   * Get file metadata
   */
  getMetadata: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        filePath: z.string().min(1).max(1024),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const metadata = await getFileContentMetadata(
          ctx.user.id,
          input.serverId,
          input.filePath
        );

        if (!metadata) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File metadata not found",
          });
        }

        return metadata;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get metadata",
        });
      }
    }),

  /**
   * Get all edited files for a server
   */
  getServerFiles: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        limit: z.number().int().positive().max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const files = await getServerEditedFiles(
          ctx.user.id,
          input.serverId,
          input.limit || 100
        );

        return files;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get server files",
        });
      }
    }),

  /**
   * Cleanup old versions
   */
  cleanupHistory: protectedProcedure
    .input(
      z.object({
        serverId: z.number().int().positive(),
        filePath: z.string().min(1).max(1024),
        keepVersions: z.number().int().positive().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const deleted = await cleanupEditHistory(
          ctx.user.id,
          input.serverId,
          input.filePath,
          input.keepVersions || 50
        );

        return { success: true, deletedCount: deleted };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to cleanup history",
        });
      }
    }),
});
