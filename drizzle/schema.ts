import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index } from 'drizzle-orm/mysql-core';

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

/**
 * Jexactyl credentials - stores API connection details
 */
export const jexactylCredentials = mysqlTable("jexactyl_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  domainUrl: varchar("domainUrl", { length: 512 }).notNull(),
  apiKey: text("apiKey").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JexactylCredential = typeof jexactylCredentials.$inferSelect;
export type InsertJexactylCredential = typeof jexactylCredentials.$inferInsert;

/**
 * Jexactyl servers - synced from API
 */
export const jexactylServers = mysqlTable("jexactyl_servers", {
  id: int("id").autoincrement().primaryKey(),
  credentialId: int("credentialId").notNull(),
  userId: int("userId").notNull(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  uuid: varchar("uuid", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  node: varchar("node", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }),
  isSuspended: int("isSuspended").default(0).notNull(),
  isInstalling: int("isInstalling").default(0).notNull(),
  isTransferring: int("isTransferring").default(0).notNull(),
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

export const alerts = mysqlTable(
  "alerts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).notNull(),
    isRead: int("isRead").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

export const alertThresholds = mysqlTable("alert_thresholds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricType: varchar("metricType", { length: 50 }).notNull(),
  threshold: int("threshold").notNull(),
  isEnabled: int("isEnabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AlertThreshold = typeof alertThresholds.$inferSelect;
export type InsertAlertThreshold = typeof alertThresholds.$inferInsert;

export const serverMetricsHistory = mysqlTable(
  "server_metrics_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    instanceId: int("instanceId").notNull(),
    cpuPercent: text("cpuPercent").notNull(),
    cpuCores: int("cpuCores").notNull(),
    memoryUsed: int("memoryUsed").notNull(),
    memoryTotal: int("memoryTotal").notNull(),
    memoryPercent: text("memoryPercent").notNull(),
    diskUsed: int("diskUsed").notNull(),
    diskTotal: int("diskTotal").notNull(),
    diskPercent: text("diskPercent").notNull(),
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

export const torrentDownloadHistory = mysqlTable(
  "torrent_download_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    instanceId: int("instanceId").notNull(),
    torrentHash: varchar("torrentHash", { length: 255 }).notNull(),
    torrentName: varchar("torrentName", { length: 255 }).notNull(),
    downloadedBytes: int("downloadedBytes").notNull(),
    totalBytes: int("totalBytes").notNull(),
    progress: text("progress").notNull(),
    downloadRate: int("downloadRate").notNull(),
    uploadRate: int("uploadRate").notNull(),
    eta: int("eta").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    userInstanceIdx: index("user_instance_torrent_idx").on(table.userId, table.instanceId),
    timestampIdx: index("timestamp_torrent_idx").on(table.timestamp),
  })
);

export type TorrentDownloadHistory = typeof torrentDownloadHistory.$inferSelect;
export type InsertTorrentDownloadHistory = typeof torrentDownloadHistory.$inferInsert;

export const serverFiles = mysqlTable(
  "server_files",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    serverId: varchar("serverId", { length: 255 }).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    filePath: varchar("filePath", { length: 512 }).notNull(),
    fileSize: int("fileSize").notNull(),
    fileType: varchar("fileType", { length: 50 }),
    isDirectory: int("isDirectory").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userServerIdx: index("user_server_idx").on(table.userId, table.serverId),
  })
);

export type ServerFile = typeof serverFiles.$inferSelect;
export type InsertServerFile = typeof serverFiles.$inferInsert;

export const fileUploads = mysqlTable(
  "file_uploads",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    serverId: varchar("serverId", { length: 255 }).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    filePath: varchar("filePath", { length: 512 }).notNull(),
    fileSize: int("fileSize").notNull(),
    uploadedBytes: int("uploadedBytes").notNull(),
    progress: text("progress").notNull(),
    status: mysqlEnum("status", ["pending", "uploading", "completed", "failed"]).notNull(),
    s3Key: varchar("s3Key", { length: 512 }),
    s3Url: varchar("s3Url", { length: 512 }),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userServerIdx: index("user_server_upload_idx").on(table.userId, table.serverId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;

export const fileContent = mysqlTable(
  "file_content",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    serverId: varchar("serverId", { length: 255 }).notNull(),
    filePath: varchar("filePath", { length: 512 }).notNull(),
    content: text("content").notNull(),
    language: varchar("language", { length: 50 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userServerFileIdx: index("user_server_file_idx").on(table.userId, table.serverId, table.filePath),
  })
);

export type FileContent = typeof fileContent.$inferSelect;
export type InsertFileContent = typeof fileContent.$inferInsert;

export const fileEditHistory = mysqlTable(
  "file_edit_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    serverId: varchar("serverId", { length: 255 }).notNull(),
    filePath: varchar("filePath", { length: 512 }).notNull(),
    content: text("content").notNull(),
    version: int("version").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userServerFileIdx: index("user_server_file_history_idx").on(table.userId, table.serverId, table.filePath),
  })
);

export type FileEditHistory = typeof fileEditHistory.$inferSelect;
export type InsertFileEditHistory = typeof fileEditHistory.$inferInsert;

export const cloudflareInstances = mysqlTable("cloudflare_instances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  apiToken: text("apiToken").notNull(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  accountEmail: varchar("accountEmail", { length: 320 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CloudflareInstance = typeof cloudflareInstances.$inferSelect;
export type InsertCloudflareInstance = typeof cloudflareInstances.$inferInsert;

export const uptimeKumaInstances = mysqlTable("uptime_kuma_instances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  apiUrl: varchar("apiUrl", { length: 512 }).notNull(),
  apiKey: text("apiKey").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UptimeKumaInstance = typeof uptimeKumaInstances.$inferSelect;
export type InsertUptimeKumaInstance = typeof uptimeKumaInstances.$inferInsert;
