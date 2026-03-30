import mysql from "mysql2/promise";
import type { DatabaseConfig } from "../config/runtime.js";

const pools = new Map<string, mysql.Pool>();

function poolKey(config: DatabaseConfig): string {
  return `${config.host}:${config.port}/${config.database}/${config.user}`;
}

export function getPool(config: DatabaseConfig): mysql.Pool {
  const key = poolKey(config);
  const existing = pools.get(key);
  if (existing) {
    return existing;
  }

  const pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  pools.set(key, pool);
  return pool;
}
