import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const jexactylServers = mysqlTable("jexactyl_servers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  apiUrl: varchar("apiUrl", { length: 512 }).notNull(),
  apiKey: text("apiKey").notNull(),
  serverId: varchar("serverId", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JexactylServer = typeof jexactylServers.$inferSelect;
export type InsertJexactylServer = typeof jexactylServers.$inferInsert;

export const qbittorrentInstances = mysqlTable("qbittorrent_instances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  apiUrl: varchar("apiUrl", { length: 512 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  password: text("password").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QbittorrentInstance = typeof qbittorrentInstances.$inferSelect;
export type InsertQbittorrentInstance = typeof qbittorrentInstances.$inferInsert;

export const glancesInstances = mysqlTable("glances_instances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  apiUrl: varchar("apiUrl", { length: 512 }).notNull(),
  apiKey: varchar("apiKey", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GlancesInstance = typeof glancesInstances.$inferSelect;
export type InsertGlancesInstance = typeof glancesInstances.$inferInsert;

export const plugins = mysqlTable("plugins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["jexactyl", "qbittorrent", "glances"]).notNull(),
  isInstalled: int("isInstalled").default(0).notNull(),
  isEnabled: int("isEnabled").default(0).notNull(),
  version: varchar("version", { length: 50 }),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plugin = typeof plugins.$inferSelect;
export type InsertPlugin = typeof plugins.$inferInsert;

export const pluginStats = mysqlTable("plugin_stats", {
  id: int("id").autoincrement().primaryKey(),
  pluginId: int("pluginId").notNull(),
  userId: int("userId").notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PluginStats = typeof pluginStats.$inferSelect;
export type InsertPluginStats = typeof pluginStats.$inferInsert;

/**
 * Server metrics history table for tracking CPU, memory, and disk usage over time
 */
export const serverMetricsHistory = mysqlTable(
  "server_metrics_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    instanceId: int("instanceId").notNull(),
    cpuPercent: decimal("cpuPercent", { precision: 5, scale: 2 }).notNull(),
    cpuCores: int("cpuCores").notNull(),
    memoryUsed: int("memoryUsed").notNull(),
    memoryTotal: int("memoryTotal").notNull(),
    memoryPercent: decimal("memoryPercent", { precision: 5, scale: 2 }).notNull(),
    diskUsed: int("diskUsed").notNull(),
    diskTotal: int("diskTotal").notNull(),
    diskPercent: decimal("diskPercent", { precision: 5, scale: 2 }).notNull(),
    networkBytesIn: int("networkBytesIn").notNull(),
    networkBytesOut: int("networkBytesOut").notNull(),
    networkPacketsIn: int("networkPacketsIn").notNull(),
    networkPacketsOut: int("networkPacketsOut").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    userInstanceIdx: index("user_instance_idx").on(table.userId, table.instanceId),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
  })
);

export type ServerMetricsHistory = typeof serverMetricsHistory.$inferSelect;
export type InsertServerMetricsHistory = typeof serverMetricsHistory.$inferInsert;

/**
 * Torrent download history table for tracking progress over time
 */
export const torrentDownloadHistory = mysqlTable(
  "torrent_download_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    instanceId: int("instanceId").notNull(),
    torrentHash: varchar("torrentHash", { length: 255 }).notNull(),
    torrentName: varchar("torrentName", { length: 512 }).notNull(),
    progress: decimal("progress", { precision: 5, scale: 2 }).notNull(),
    downloadSpeed: int("downloadSpeed").notNull(),
    uploadSpeed: int("uploadSpeed").notNull(),
    eta: int("eta").notNull(),
    status: mysqlEnum("status", ["downloading", "seeding", "paused", "stopped", "error"]).notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    userInstanceIdx: index("torrent_user_instance_idx").on(table.userId, table.instanceId),
    torrentHashIdx: index("torrent_hash_idx").on(table.torrentHash),
    timestampIdx: index("torrent_timestamp_idx").on(table.timestamp),
  })
);

export type TorrentDownloadHistory = typeof torrentDownloadHistory.$inferSelect;
export type InsertTorrentDownloadHistory = typeof torrentDownloadHistory.$inferInsert;
