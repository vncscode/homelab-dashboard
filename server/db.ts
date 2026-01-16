import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, jexactylServers, qbittorrentInstances, glancesInstances, InsertJexactylServer, InsertQbittorrentInstance, InsertGlancesInstance, plugins, pluginStats, Plugin, InsertPlugin, PluginStats, InsertPluginStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
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
      const normalized = value ?? null;
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
      values.role = 'admin';
      updateSet.role = 'admin';
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
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getJexactylServers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jexactylServers).where(eq(jexactylServers.userId, userId));
}

export async function getQbittorrentInstances(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(qbittorrentInstances).where(eq(qbittorrentInstances.userId, userId));
}

export async function getGlancesInstances(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(glancesInstances).where(eq(glancesInstances.userId, userId));
}

export async function createJexactylServer(userId: number, data: InsertJexactylServer) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(jexactylServers).values({ ...data, userId });
}

export async function updateJexactylServer(id: number, data: Partial<InsertJexactylServer>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(jexactylServers).set(data).where(eq(jexactylServers.id, id));
}

export async function deleteJexactylServer(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(jexactylServers).where(eq(jexactylServers.id, id));
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
