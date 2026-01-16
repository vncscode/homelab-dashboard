import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getServerMetricsHistory,
  getTorrentDownloadHistory,
  getAllTorrentsHistory,
  deleteOldMetricsHistory,
  deleteOldTorrentHistory,
} from "../db.history";
import { TRPCError } from "@trpc/server";

/**
 * Analytics router for querying historical data
 */
export const analyticsRouter = router({
  /**
   * Get server metrics history for a time range
   */
  getServerMetricsHistory: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive"),
        startTime: z.date(),
        endTime: z.date(),
        limit: z.number().int().positive().default(1000),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (input.startTime >= input.endTime) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start time must be before end time",
          });
        }

        const results = await getServerMetricsHistory(
          ctx.user.id,
          input.instanceId,
          input.startTime,
          input.endTime,
          input.limit
        );

        return results.map((record) => ({
          ...record,
          cpuPercent: parseFloat(record.cpuPercent.toString()),
          memoryPercent: parseFloat(record.memoryPercent.toString()),
          diskPercent: parseFloat(record.diskPercent.toString()),
        }));
      } catch (error) {
        console.error("[Analytics] Error getting server metrics history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch server metrics history",
        });
      }
    }),

  /**
   * Get torrent download history for a specific torrent
   */
  getTorrentHistory: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive"),
        torrentHash: z.string().min(1, "Torrent hash is required"),
        startTime: z.date(),
        endTime: z.date(),
        limit: z.number().int().positive().default(1000),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (input.startTime >= input.endTime) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start time must be before end time",
          });
        }

        const results = await getTorrentDownloadHistory(
          ctx.user.id,
          input.instanceId,
          input.torrentHash,
          input.startTime,
          input.endTime,
          input.limit
        );

        return results.map((record) => ({
          ...record,
          progress: parseFloat(record.progress.toString()),
        }));
      } catch (error) {
        console.error("[Analytics] Error getting torrent history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch torrent history",
        });
      }
    }),

  /**
   * Get all torrents history for an instance
   */
  getAllTorrentsHistory: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive"),
        startTime: z.date(),
        endTime: z.date(),
        limit: z.number().int().positive().default(5000),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (input.startTime >= input.endTime) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start time must be before end time",
          });
        }

        const results = await getAllTorrentsHistory(
          ctx.user.id,
          input.instanceId,
          input.startTime,
          input.endTime,
          input.limit
        );

        return results.map((record) => ({
          ...record,
          progress: parseFloat(record.progress.toString()),
        }));
      } catch (error) {
        console.error("[Analytics] Error getting all torrents history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch torrents history",
        });
      }
    }),

  /**
   * Get statistics summary for a time range
   */
  getMetricsStatistics: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive"),
        startTime: z.date(),
        endTime: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (input.startTime >= input.endTime) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start time must be before end time",
          });
        }

        const results = await getServerMetricsHistory(
          ctx.user.id,
          input.instanceId,
          input.startTime,
          input.endTime,
          10000
        );

        if (results.length === 0) {
          return {
            dataPoints: 0,
            cpu: { min: 0, max: 0, avg: 0 },
            memory: { min: 0, max: 0, avg: 0 },
            disk: { min: 0, max: 0, avg: 0 },
          };
        }

        const cpuValues = results.map((r) => parseFloat(r.cpuPercent.toString()));
        const memoryValues = results.map((r) => parseFloat(r.memoryPercent.toString()));
        const diskValues = results.map((r) => parseFloat(r.diskPercent.toString()));

        const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

        return {
          dataPoints: results.length,
          cpu: {
            min: Math.min(...cpuValues),
            max: Math.max(...cpuValues),
            avg: avg(cpuValues),
          },
          memory: {
            min: Math.min(...memoryValues),
            max: Math.max(...memoryValues),
            avg: avg(memoryValues),
          },
          disk: {
            min: Math.min(...diskValues),
            max: Math.max(...diskValues),
            avg: avg(diskValues),
          },
        };
      } catch (error) {
        console.error("[Analytics] Error getting metrics statistics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch metrics statistics",
        });
      }
    }),

  /**
   * Clean up old metrics history
   */
  cleanupOldMetrics: protectedProcedure
    .input(
      z.object({
        daysOld: z.number().int().min(1, "Must be at least 1 day old"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const beforeDate = new Date();
        beforeDate.setDate(beforeDate.getDate() - input.daysOld);

        const metricsDeleted = await deleteOldMetricsHistory(beforeDate);
        const torrentsDeleted = await deleteOldTorrentHistory(beforeDate);

        return {
          success: true,
          metricsDeleted,
          torrentsDeleted,
          message: `Cleaned up data older than ${input.daysOld} days`,
        };
      } catch (error) {
        console.error("[Analytics] Error cleaning up old data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cleanup old data",
        });
      }
    }),
});
