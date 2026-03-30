import type { RowDataPacket } from "mysql2";
import type { DatabaseConfig } from "../config/runtime.js";
import { getPool } from "./database.js";

const tableCache = new Map<string, Set<string>>();
const columnCache = new Map<string, Set<string>>();

function configKey(config: DatabaseConfig): string {
  return `${config.host}:${config.port}/${config.database}/${config.user}`;
}

export async function getExistingTables(
  config: DatabaseConfig,
  candidates: string[]
): Promise<Set<string>> {
  const key = `${configKey(config)}:tables`;
  const cached = tableCache.get(key);
  if (cached) {
    return new Set(candidates.filter((name) => cached.has(name)));
  }

  const pool = getPool(config);
  const placeholders = candidates.map(() => "?").join(", ");
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = ?
       AND table_name IN (${placeholders})`,
    [config.database, ...candidates]
  );

  const tables = new Set(rows.map((row) => String(row.table_name)));
  tableCache.set(key, tables);
  return tables;
}

export async function getTableColumns(
  config: DatabaseConfig,
  tableName: string
): Promise<Set<string>> {
  const key = `${configKey(config)}:columns:${tableName}`;
  const cached = columnCache.get(key);
  if (cached) {
    return cached;
  }

  const pool = getPool(config);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = ?
       AND table_name = ?`,
    [config.database, tableName]
  );

  const columns = new Set(rows.map((row) => String(row.column_name)));
  columnCache.set(key, columns);
  return columns;
}
