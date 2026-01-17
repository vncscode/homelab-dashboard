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

/**
 * Alert thresholds table for configuring CPU and memory limits
 */
export const alertThresholds = mysqlTable(
  "alert_thresholds",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    instanceId: int("instanceId").notNull(),
    cpuThreshold: decimal("cpuThreshold", { precision: 5, scale: 2 }).notNull().default("80"),
    memoryThreshold: decimal("memoryThreshold", { precision: 5, scale: 2 }).notNull().default("85"),
    diskThreshold: decimal("diskThreshold", { precision: 5, scale: 2 }).notNull().default("90"),
    isEnabled: int("isEnabled").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userInstanceIdx: index("threshold_user_instance_idx").on(table.userId, table.instanceId),
  })
);

export type AlertThreshold = typeof alertThresholds.$inferSelect;
export type InsertAlertThreshold = typeof alertThresholds.$inferInsert;

/**
 * Alerts history table for tracking triggered alerts
 */
export const alerts = mysqlTable(
  "alerts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    instanceId: int("instanceId").notNull(),
    alertType: mysqlEnum("alertType", ["cpu", "memory", "disk"]).notNull(),
    severity: mysqlEnum("severity", ["warning", "critical"]).notNull(),
    currentValue: decimal("currentValue", { precision: 5, scale: 2 }).notNull(),
    threshold: decimal("threshold", { precision: 5, scale: 2 }).notNull(),
    message: text("message").notNull(),
    isResolved: int("isResolved").default(0).notNull(),
    resolvedAt: timestamp("resolvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userInstanceIdx: index("alert_user_instance_idx").on(table.userId, table.instanceId),
    alertTypeIdx: index("alert_type_idx").on(table.alertType),
    severityIdx: index("severity_idx").on(table.severity),
    isResolvedIdx: index("is_resolved_idx").on(table.isResolved),
    createdAtIdx: index("alert_created_at_idx").on(table.createdAt),
  })
);

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// File uploads for Jexactyl servers
export const fileUploads = mysqlTable(
  "file_uploads",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    serverId: int("serverId").notNull(),
    fileName: varchar("fileName", { length: 512 }).notNull(),
    fileSize: int("fileSize").notNull(), // in bytes
    filePath: varchar("filePath", { length: 1024 }).notNull(), // path on server
    mimeType: varchar("mimeType", { length: 255 }).notNull(),
    s3Key: varchar("s3Key", { length: 512 }), // S3 storage key if applicable
    s3Url: text("s3Url"), // S3 URL for download
    status: mysqlEnum("status", ["pending", "uploading", "completed", "failed"]).default("pending").notNull(),
    progress: int("progress").default(0).notNull(), // 0-100
    errorMessage: text("errorMessage"),
    uploadedAt: timestamp("uploadedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userServerIdx: index("upload_user_server_idx").on(table.userId, table.serverId),
    statusIdx: index("upload_status_idx").on(table.status),
    createdAtIdx: index("upload_created_at_idx").on(table.createdAt),
  })
);

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;

// Server file listings
export const serverFiles = mysqlTable(
  "server_files",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    serverId: int("serverId").notNull(),
    fileName: varchar("fileName", { length: 512 }).notNull(),
    filePath: varchar("filePath", { length: 1024 }).notNull(),
    fileSize: int("fileSize").notNull(), // in bytes
    mimeType: varchar("mimeType", { length: 255 }).notNull(),
    isDirectory: int("isDirectory").default(0).notNull(),
    lastModified: timestamp("lastModified"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userServerPathIdx: index("file_user_server_path_idx").on(table.userId, table.serverId, table.filePath),
    createdAtIdx: index("file_created_at_idx").on(table.createdAt),
  })
);

export type ServerFile = typeof serverFiles.$inferSelect;
export type InsertServerFile = typeof serverFiles.$inferInsert;

// File edit history for version control
export const fileEditHistory = mysqlTable(
  "file_edit_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    serverId: int("serverId").notNull(),
    filePath: varchar("filePath", { length: 1024 }).notNull(),
    content: text("content").notNull(),
    previousContent: text("previousContent"),
    changeSize: int("changeSize"), // bytes changed
    editMessage: varchar("editMessage", { length: 512 }), // user's description of changes
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userServerFileIdx: index("edit_user_server_file_idx").on(table.userId, table.serverId, table.filePath),
    createdAtIdx: index("edit_created_at_idx").on(table.createdAt),
  })
);

export type FileEditHistory = typeof fileEditHistory.$inferSelect;
export type InsertFileEditHistory = typeof fileEditHistory.$inferInsert;

// Current file content cache
export const fileContent = mysqlTable(
  "file_content",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    serverId: int("serverId").notNull(),
    filePath: varchar("filePath", { length: 1024 }).notNull().unique(),
    content: text("content").notNull(),
    fileSize: int("fileSize").notNull(),
    mimeType: varchar("mimeType", { length: 255 }).notNull(),
    lastEditedBy: int("lastEditedBy"),
    lastEditedAt: timestamp("lastEditedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userServerFileIdx: index("content_user_server_file_idx").on(table.userId, table.serverId, table.filePath),
    updatedAtIdx: index("content_updated_at_idx").on(table.updatedAt),
  })
);

export type FileContent = typeof fileContent.$inferSelect;
export type InsertFileContent = typeof fileContent.$inferInsert;
