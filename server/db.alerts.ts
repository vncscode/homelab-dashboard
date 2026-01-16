import { eq, and, lte, gte, desc } from "drizzle-orm";
import { alerts, alertThresholds } from "../drizzle/schema";
import type { InsertAlert, InsertAlertThreshold } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get or create alert thresholds for an instance
 */
export async function getOrCreateThresholds(
  userId: number,
  instanceId: number
): Promise<any> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get thresholds: database not available");
    return null;
  }

  try {
    // Try to find existing thresholds
    const existing = await db
      .select()
      .from(alertThresholds)
      .where(
        and(
          eq(alertThresholds.userId, userId),
          eq(alertThresholds.instanceId, instanceId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create default thresholds
    await db.insert(alertThresholds).values({
      userId,
      instanceId,
      cpuThreshold: "80",
      memoryThreshold: "85",
      diskThreshold: "90",
      isEnabled: 1,
    } as any);

    const created = await db
      .select()
      .from(alertThresholds)
      .where(
        and(
          eq(alertThresholds.userId, userId),
          eq(alertThresholds.instanceId, instanceId)
        )
      )
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get or create thresholds:", error);
    throw error;
  }
}

/**
 * Update alert thresholds
 */
export async function updateThresholds(
  userId: number,
  instanceId: number,
  data: Partial<Omit<InsertAlertThreshold, "userId" | "instanceId">>
): Promise<void> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update thresholds: database not available");
    return;
  }

  try {
    await db
      .update(alertThresholds)
      .set(data)
      .where(
        and(
          eq(alertThresholds.userId, userId),
          eq(alertThresholds.instanceId, instanceId)
        )
      );
  } catch (error) {
    console.error("[Database] Failed to update thresholds:", error);
    throw error;
  }
}

/**
 * Create a new alert
 */
export async function createAlert(
  userId: number,
  instanceId: number,
  data: Omit<InsertAlert, "userId" | "instanceId">
): Promise<any> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }
  if (!data.alertType || !["cpu", "memory", "disk"].includes(data.alertType)) {
    throw new Error("Invalid alert type");
  }
  if (!data.severity || !["warning", "critical"].includes(data.severity)) {
    throw new Error("Invalid severity");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create alert: database not available");
    return null;
  }

  try {
    const result = await db.insert(alerts).values({
      userId,
      instanceId,
      ...data,
    });

    // Return the created alert
    const created = await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create alert:", error);
    throw error;
  }
}

/**
 * Get active alerts for an instance
 */
export async function getActiveAlerts(
  userId: number,
  instanceId?: number,
  limit: number = 100
): Promise<any[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active alerts: database not available");
    return [];
  }

  try {
    let query = db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.userId, userId),
          eq(alerts.isResolved, 0)
        )
      );

    if (instanceId && instanceId > 0) {
      query = db
        .select()
        .from(alerts)
        .where(
          and(
            eq(alerts.userId, userId),
            eq(alerts.instanceId, instanceId),
            eq(alerts.isResolved, 0)
          )
        );
    }

    const results = await query
      .orderBy(desc(alerts.createdAt))
      .limit(limit);

    return results.map((alert) => ({
      ...alert,
      currentValue: parseFloat(alert.currentValue.toString()),
      threshold: parseFloat(alert.threshold.toString()),
    }));
  } catch (error) {
    console.error("[Database] Failed to get active alerts:", error);
    throw error;
  }
}

/**
 * Get all alerts for an instance with pagination
 */
export async function getAllAlerts(
  userId: number,
  instanceId: number,
  limit: number = 100,
  offset: number = 0
): Promise<any[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(instanceId) || instanceId <= 0) {
    throw new Error("Invalid instanceId");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all alerts: database not available");
    return [];
  }

  try {
    const results = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.userId, userId),
          eq(alerts.instanceId, instanceId)
        )
      )
      .orderBy(desc(alerts.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((alert) => ({
      ...alert,
      currentValue: parseFloat(alert.currentValue.toString()),
      threshold: parseFloat(alert.threshold.toString()),
    }));
  } catch (error) {
    console.error("[Database] Failed to get all alerts:", error);
    throw error;
  }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: number): Promise<void> {
  if (!Number.isInteger(alertId) || alertId <= 0) {
    throw new Error("Invalid alert ID");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot resolve alert: database not available");
    return;
  }

  try {
    await db
      .update(alerts)
      .set({
        isResolved: 1,
        resolvedAt: new Date(),
      } as any)
      .where(eq(alerts.id, alertId));
  } catch (error) {
    console.error("[Database] Failed to resolve alert:", error);
    throw error;
  }
}

/**
 * Check if an alert should be triggered based on thresholds
 */
export function shouldTriggerAlert(
  currentValue: number,
  threshold: number,
  severity: "warning" | "critical" = "warning"
): boolean {
  if (severity === "critical") {
    return currentValue >= threshold;
  }
  // For warning, trigger at 90% of threshold
  return currentValue >= threshold * 0.9;
}

/**
 * Get alert severity based on how much threshold is exceeded
 */
export function getAlertSeverity(
  currentValue: number,
  threshold: number
): "warning" | "critical" {
  const percentageExceeded = (currentValue / threshold) * 100;
  return percentageExceeded >= 100 ? "critical" : "warning";
}

/**
 * Delete old alerts (older than specified date)
 */
export async function deleteOldAlerts(beforeDate: Date): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete old alerts: database not available");
    return 0;
  }

  try {
    await db
      .delete(alerts)
      .where(
        and(
          eq(alerts.isResolved, 1),
          lte(alerts.createdAt, beforeDate)
        )
      );

    return 1; // Successfully deleted
  } catch (error) {
    console.error("[Database] Failed to delete old alerts:", error);
    throw error;
  }
}
