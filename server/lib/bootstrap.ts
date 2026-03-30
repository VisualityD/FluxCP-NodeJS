import mysql from "mysql2/promise";
import path from "node:path";
import { runtimeConfig, type DatabaseConfig } from "../config/runtime.js";
import { loadLegacyServerConfig } from "../config/legacy-config.js";

async function canConnect(config: DatabaseConfig): Promise<boolean> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    await connection.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await connection?.end().catch(() => undefined);
  }
}

export async function initializeDatabaseConfig(): Promise<void> {
  const rootDir = path.resolve(process.cwd(), "..");
  const legacy = loadLegacyServerConfig(rootDir);

  const loginCandidates: Array<{ source: string; config: DatabaseConfig }> = [
    { source: ".env", config: runtimeConfig.loginDatabase }
  ];
  const charCandidates: Array<{ source: string; config: DatabaseConfig }> = [
    { source: ".env", config: runtimeConfig.charDatabase }
  ];

  if (legacy?.loginDatabase) {
    loginCandidates.push({ source: "config/servers.php", config: legacy.loginDatabase });
  }
  if (legacy?.charDatabase) {
    charCandidates.push({ source: "config/servers.php", config: legacy.charDatabase });
  }

  for (const candidate of loginCandidates) {
    if (await canConnect(candidate.config)) {
      runtimeConfig.loginDatabase = candidate.config;
      if (candidate.source === "config/servers.php") {
        if (typeof legacy?.loginUseMd5 === "boolean") runtimeConfig.loginUseMd5 = legacy.loginUseMd5;
        if (typeof legacy?.loginNoCase === "boolean") runtimeConfig.loginNoCase = legacy.loginNoCase;
        if (legacy?.serverName) runtimeConfig.serverName = legacy.serverName;
      }
      console.log(`[bootstrap] Using login DB config from ${candidate.source}`);
      break;
    }
  }

  for (const candidate of charCandidates) {
    if (await canConnect(candidate.config)) {
      runtimeConfig.charDatabase = candidate.config;
      if (candidate.source === "config/servers.php" && legacy?.serverName) {
        runtimeConfig.serverName = legacy.serverName;
      }
      console.log(`[bootstrap] Using char DB config from ${candidate.source}`);
      break;
    }
  }

  if (!(await canConnect(runtimeConfig.loginDatabase))) {
    console.warn("[bootstrap] Unable to connect to login DB using either .env or config/servers.php");
  }

  if (!(await canConnect(runtimeConfig.charDatabase))) {
    console.warn("[bootstrap] Unable to connect to char DB using either .env or config/servers.php");
  }
}
