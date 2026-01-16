import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getOrCreateThresholds,
  updateThresholds,
  createAlert,
  getActiveAlerts,
  getAllAlerts,
  resolveAlert,
  deleteOldAlerts,
  shouldTriggerAlert,
  getAlertSeverity,
} from "../db.alerts";
import { TRPCError } from "@trpc/server";

/**
 * Alerts router for managing alert thresholds and history
 */
export const alertsRouter = router({
  /**
   * Get alert thresholds for an instance
   */
  getThresholds: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive"),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const thresholds = await getOrCreateThresholds(ctx.user.id, input.instanceId);

        if (!thresholds) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Thresholds not found",
          });
        }

        return {
          ...thresholds,
          cpuThreshold: parseFloat(thresholds.cpuThreshold.toString()),
          memoryThreshold: parseFloat(thresholds.memoryThreshold.toString()),
          diskThreshold: parseFloat(thresholds.diskThreshold.toString()),
        };
      } catch (error) {
        console.error("[Alerts] Error getting thresholds:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch thresholds",
        });
      }
    }),

  /**
   * Update alert thresholds
   */
  updateThresholds: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive"),
        cpuThreshold: z.number().min(0).max(100).optional(),
        memoryThreshold: z.number().min(0).max(100).optional(),
        diskThreshold: z.number().min(0).max(100).optional(),
        isEnabled: z.number().int().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { instanceId, ...updateData } = input;

        await updateThresholds(ctx.user.id, instanceId, updateData as any);

        return {
          success: true,
          message: "Thresholds updated successfully",
        };
      } catch (error) {
        console.error("[Alerts] Error updating thresholds:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update thresholds",
        });
      }
    }),

  /**
   * Get active alerts for an instance
   */
  getActiveAlerts: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive").optional(),
        limit: z.number().int().positive().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const alerts = await getActiveAlerts(
          ctx.user.id,
          input.instanceId,
          input.limit
        );

        return alerts;
      } catch (error) {
        console.error("[Alerts] Error getting active alerts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch active alerts",
        });
      }
    }),

  /**
   * Get all alerts for an instance
   */
  getAllAlerts: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive"),
        limit: z.number().int().positive().default(100),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const alerts = await getAllAlerts(
          ctx.user.id,
          input.instanceId,
          input.limit,
          input.offset
        );

        return alerts;
      } catch (error) {
        console.error("[Alerts] Error getting all alerts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch alerts",
        });
      }
    }),

  /**
   * Resolve an alert
   */
  resolveAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.number().int().positive("Alert ID must be positive"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await resolveAlert(input.alertId);

        return {
          success: true,
          message: "Alert resolved successfully",
        };
      } catch (error) {
        console.error("[Alerts] Error resolving alert:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resolve alert",
        });
      }
    }),

  /**
   * Check and trigger alerts based on current metrics
   */
  checkMetrics: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int().positive("Instance ID must be positive"),
        cpuPercent: z.number().min(0).max(100),
        memoryPercent: z.number().min(0).max(100),
        diskPercent: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const thresholds = await getOrCreateThresholds(ctx.user.id, input.instanceId);

        if (!thresholds) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Thresholds not found",
          });
        }

        const cpuThreshold = parseFloat(thresholds.cpuThreshold.toString());
        const memoryThreshold = parseFloat(thresholds.memoryThreshold.toString());
        const diskThreshold = parseFloat(thresholds.diskThreshold.toString());

        const triggeredAlerts = [];

        // Check CPU
        if (shouldTriggerAlert(input.cpuPercent, cpuThreshold)) {
          const severity = getAlertSeverity(input.cpuPercent, cpuThreshold);
          const alert = await createAlert(ctx.user.id, input.instanceId, {
            alertType: "cpu",
            severity,
            currentValue: input.cpuPercent.toString(),
            threshold: cpuThreshold.toString(),
            message: `CPU usage is ${input.cpuPercent.toFixed(1)}% (threshold: ${cpuThreshold}%)`,
            isResolved: 0,
          } as any);
          if (alert) triggeredAlerts.push(alert);
        }

        // Check Memory
        if (shouldTriggerAlert(input.memoryPercent, memoryThreshold)) {
          const severity = getAlertSeverity(input.memoryPercent, memoryThreshold);
          const alert = await createAlert(ctx.user.id, input.instanceId, {
            alertType: "memory",
            severity,
            currentValue: input.memoryPercent.toString(),
            threshold: memoryThreshold.toString(),
            message: `Memory usage is ${input.memoryPercent.toFixed(1)}% (threshold: ${memoryThreshold}%)`,
            isResolved: 0,
          } as any);
          if (alert) triggeredAlerts.push(alert);
        }

        // Check Disk
        if (shouldTriggerAlert(input.diskPercent, diskThreshold)) {
          const severity = getAlertSeverity(input.diskPercent, diskThreshold);
          const alert = await createAlert(ctx.user.id, input.instanceId, {
            alertType: "disk",
            severity,
            currentValue: input.diskPercent.toString(),
            threshold: diskThreshold.toString(),
            message: `Disk usage is ${input.diskPercent.toFixed(1)}% (threshold: ${diskThreshold}%)`,
            isResolved: 0,
          } as any);
          if (alert) triggeredAlerts.push(alert);
        }

        return {
          success: true,
          triggeredAlerts,
          message: `${triggeredAlerts.length} alert(s) triggered`,
        };
      } catch (error) {
        console.error("[Alerts] Error checking metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check metrics",
        });
      }
    }),

  /**
   * Clean up old alerts
   */
  cleanupOldAlerts: protectedProcedure
    .input(
      z.object({
        daysOld: z.number().int().min(1, "Must be at least 1 day old"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const beforeDate = new Date();
        beforeDate.setDate(beforeDate.getDate() - input.daysOld);

        await deleteOldAlerts(beforeDate);

        return {
          success: true,
          message: `Cleaned up alerts older than ${input.daysOld} days`,
        };
      } catch (error) {
        console.error("[Alerts] Error cleaning up old alerts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cleanup old alerts",
        });
      }
    }),
});
