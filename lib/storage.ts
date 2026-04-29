import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
const cache = new Map<string, string>();

const useSqliteStorage = String(process.env.EXPO_PUBLIC_STORAGE_SQLITE ?? 'yes').toLowerCase() === 'yes';

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('scrolfy.db');
      await db.execAsync('CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);');
      return db;
    })();
  }
  return dbPromise;
}

async function getFromSqlite(key: string): Promise<string | null> {
  if (!useSqliteStorage || Platform.OS === 'web') return null;
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv_store WHERE key = ? LIMIT 1;', [key]);
  return row?.value ?? null;
}

async function setToSqlite(key: string, value: string): Promise<void> {
  if (!useSqliteStorage || Platform.OS === 'web') return;
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
    [key, value],
  );
}

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const fromCache = cache.get(key);
    if (fromCache) return JSON.parse(fromCache) as T;
    const raw = (await getFromSqlite(key)) ?? (await AsyncStorage.getItem(key));
    if (!raw) return fallback;
    cache.set(key, raw);
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  const raw = JSON.stringify(value);
  cache.set(key, raw);
  await Promise.all([AsyncStorage.setItem(key, raw), setToSqlite(key, raw)]);
}

