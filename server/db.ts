import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { InsertUser, users, jexactylCredentials, jexactylServers, qbittorrentInstances, glancesInstances, cloudflareInstances, uptimeKumaInstances, InsertJexactylCredential, InsertJexactylServer, InsertQbittorrentInstance, InsertGlancesInstance, InsertCloudflareInstance, InsertUptimeKumaInstance, plugins, pluginStats, Plugin, InsertPlugin, PluginStats, InsertPluginStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: MySql2Database | null = null;
let _dbInitialized = false;

/**
 * Lazily create the drizzle instance so local tooling can run without a DB.
 * Uses singleton pattern to ensure only one connection is created.
 */
export async function getDb(): Promise<MySql2Database | null> {
  if (_dbInitialized) return _db;
  
  if (process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      _dbInitialized = true;
    } catch (error) {
      console.error("[Database] Failed to connect:", error instanceof Error ? error.message : String(error));
      _db = null;
      _dbInitialized = true;
    }
  } else {
    console.warn("[Database] DATABASE_URL not configured");
    _dbInitialized = true;
  }
  
  return _db;
}

/**
 * Ensure database connection is available, throw if not
 */
function ensureDb(db: MySql2Database | null): asserts db is MySql2Database {
  if (!db) {
    throw new Error("[Database] Database connection not available");
  }
}

/**
 * Upsert user with proper validation and error handling
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId?.trim()) {
    throw new Error("User openId is required and cannot be empty");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot upsert user: database not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value?.trim() || null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error instanceof Error ? error.message : String(error));
    throw new Error(`Failed to upsert user: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get user by OpenId with proper error handling
 */
export async function getUserByOpenId(openId: string): Promise<(typeof users.$inferSelect) | undefined> {
  if (!openId?.trim()) {
    return undefined;
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by openId:", error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

/**
 * Get all Jexactyl credentials for a user
 */
export async function getJexactylServers(userId: number): Promise<(typeof jexactylCredentials.$inferSelect)[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(jexactylCredentials).where(eq(jexactylCredentials.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get Jexactyl credentials:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Get all qBittorrent instances for a user
 */
export async function getQbittorrentInstances(userId: number): Promise<(typeof qbittorrentInstances.$inferSelect)[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(qbittorrentInstances).where(eq(qbittorrentInstances.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get qBittorrent instances:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Get all Glances instances for a user
 */
export async function getGlancesInstances(userId: number): Promise<(typeof glancesInstances.$inferSelect)[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(glancesInstances).where(eq(glancesInstances.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get Glances instances:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Create a new Jexactyl credential with validation
 */
export async function createJexactylServer(userId: number, data: InsertJexactylCredential): Promise<void> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!data.name?.trim() || !data.domainUrl?.trim()) {
    throw new Error("Server name and domain URL are required");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.insert(jexactylCredentials).values({ ...data, userId });
  } catch (error) {
    throw new Error(`Failed to create Jexactyl server: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Update a Jexactyl credential with validation
 */
export async function updateJexactylServer(id: number, data: Partial<InsertJexactylCredential>): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid credential id");
  }
  if (Object.keys(data).length === 0) {
    throw new Error("No data to update");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.update(jexactylCredentials).set(data).where(eq(jexactylCredentials.id, id));
  } catch (error) {
    throw new Error(`Failed to update Jexactyl credential: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Delete a Jexactyl credential with validation
 */
export async function deleteJexactylServer(id: number): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid credential id");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.delete(jexactylCredentials).where(eq(jexactylCredentials.id, id));
  } catch (error) {
    throw new Error(`Failed to delete Jexactyl credential: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function createQbittorrentInstance(userId: number, data: InsertQbittorrentInstance) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(qbittorrentInstances).values({ ...data, userId });
}

export async function updateQbittorrentInstance(id: number, data: Partial<InsertQbittorrentInstance>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(qbittorrentInstances).set(data).where(eq(qbittorrentInstances.id, id));
}

export async function deleteQbittorrentInstance(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(qbittorrentInstances).where(eq(qbittorrentInstances.id, id));
}

export async function createGlancesInstance(userId: number, data: InsertGlancesInstance) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(glancesInstances).values({ ...data, userId });
}

export async function updateGlancesInstance(id: number, data: Partial<InsertGlancesInstance>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(glancesInstances).set(data).where(eq(glancesInstances.id, id));
}

export async function deleteGlancesInstance(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(glancesInstances).where(eq(glancesInstances.id, id));
}

/**
 * Get all Cloudflare instances for a user
 */
export async function getCloudflareInstances(userId: number): Promise<(typeof cloudflareInstances.$inferSelect)[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(cloudflareInstances).where(eq(cloudflareInstances.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get Cloudflare instances:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Create a new Cloudflare instance with validation
 */
export async function createCloudflareInstance(userId: number, data: InsertCloudflareInstance): Promise<void> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!data.name?.trim() || !data.apiToken?.trim()) {
    throw new Error("Instance name and API token are required");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.insert(cloudflareInstances).values({ ...data, userId });
  } catch (error) {
    throw new Error(`Failed to create Cloudflare instance: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Update a Cloudflare instance with validation
 */
export async function updateCloudflareInstance(id: number, data: Partial<InsertCloudflareInstance>): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid instance id");
  }
  if (Object.keys(data).length === 0) {
    throw new Error("No data to update");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.update(cloudflareInstances).set(data).where(eq(cloudflareInstances.id, id));
  } catch (error) {
    throw new Error(`Failed to update Cloudflare instance: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Delete a Cloudflare instance with validation
 */
export async function deleteCloudflareInstance(id: number): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid instance id");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.delete(cloudflareInstances).where(eq(cloudflareInstances.id, id));
  } catch (error) {
    throw new Error(`Failed to delete Cloudflare instance: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get all Uptime Kuma instances for a user
 */
export async function getUptimeKumaInstances(userId: number): Promise<(typeof uptimeKumaInstances.$inferSelect)[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(uptimeKumaInstances).where(eq(uptimeKumaInstances.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get Uptime Kuma instances:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Create a new Uptime Kuma instance with validation
 */
export async function createUptimeKumaInstance(userId: number, data: InsertUptimeKumaInstance): Promise<void> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!data.name?.trim() || !data.apiUrl?.trim()) {
    throw new Error("Instance name and API URL are required");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.insert(uptimeKumaInstances).values({ ...data, userId });
  } catch (error) {
    throw new Error(`Failed to create Uptime Kuma instance: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Update an Uptime Kuma instance with validation
 */
export async function updateUptimeKumaInstance(id: number, data: Partial<InsertUptimeKumaInstance>): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid instance id");
  }
  if (Object.keys(data).length === 0) {
    throw new Error("No data to update");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.update(uptimeKumaInstances).set(data).where(eq(uptimeKumaInstances.id, id));
  } catch (error) {
    throw new Error(`Failed to update Uptime Kuma instance: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Delete an Uptime Kuma instance with validation
 */
export async function deleteUptimeKumaInstance(id: number): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid instance id");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    await db.delete(uptimeKumaInstances).where(eq(uptimeKumaInstances.id, id));
  } catch (error) {
    throw new Error(`Failed to delete Uptime Kuma instance: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function getPlugins(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(plugins).where(eq(plugins.userId, userId));
}

export async function getPluginById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(plugins).where(eq(plugins.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPlugin(userId: number, data: InsertPlugin) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(plugins).values({ ...data, userId });
}

export async function updatePlugin(id: number, data: Partial<InsertPlugin>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(plugins).set(data).where(eq(plugins.id, id));
}

export async function deletePlugin(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(plugins).where(eq(plugins.id, id));
}

export async function getPluginStats(pluginId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pluginStats).where(eq(pluginStats.pluginId, pluginId));
}

export async function updatePluginStats(pluginId: number, userId: number, key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const existing = await db.select().from(pluginStats).where(
    and(eq(pluginStats.pluginId, pluginId), eq(pluginStats.key, key))
  ).limit(1);
  
  if (existing.length > 0) {
    await db.update(pluginStats).set({ value }).where(eq(pluginStats.id, existing[0].id));
  } else {
    await db.insert(pluginStats).values({ pluginId, userId, key, value });
  }
}

// TODO: add feature queries here as your schema grows.


/**
 * Get Jexactyl credential by ID
 */
export async function getJexactylCredentialById(id: number): Promise<typeof jexactylCredentials.$inferSelect | undefined> {
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }

  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(jexactylCredentials).where(eq(jexactylCredentials.id, id));
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get Jexactyl credential:", error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

/**
 * Sync Jexactyl servers from API to database
 */
export async function syncJexactylServers(
  credentialId: number,
  userId: number,
  servers: InsertJexactylServer[]
): Promise<void> {
  if (!Number.isInteger(credentialId) || credentialId <= 0) {
    throw new Error("Invalid credentialId");
  }
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }

  const db = await getDb();
  ensureDb(db);

  try {
    // Delete existing servers for this credential
    await db.delete(jexactylServers).where(eq(jexactylServers.credentialId, credentialId));

    // Insert new servers
    if (servers.length > 0) {
      await db.insert(jexactylServers).values(
        servers.map(server => ({
          ...server,
          credentialId,
          userId,
        }))
      );
    }
  } catch (error) {
    throw new Error(`Failed to sync Jexactyl servers: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get synced Jexactyl servers for a credential
 */
export async function getJexactylServersByCredential(credentialId: number): Promise<(typeof jexactylServers.$inferSelect)[]> {
  if (!Number.isInteger(credentialId) || credentialId <= 0) {
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(jexactylServers).where(eq(jexactylServers.credentialId, credentialId));
  } catch (error) {
    console.error("[Database] Failed to get Jexactyl servers by credential:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Get all synced Jexactyl servers for a user
 */
export async function getAllJexactylServers(userId: number): Promise<(typeof jexactylServers.$inferSelect)[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(jexactylServers).where(eq(jexactylServers.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get all Jexactyl servers:", error instanceof Error ? error.message : String(error));
    return [];
  }
}
