import fs from "node:fs";
import path from "node:path";
import type { DatabaseConfig } from "./runtime.js";

export type LegacyServerConfig = {
  serverName?: string;
  loginDatabase?: DatabaseConfig;
  charDatabase?: DatabaseConfig;
  loginUseMd5?: boolean;
  loginNoCase?: boolean;
};

function extractString(content: string, section: string, key: string): string | undefined {
  const sectionMatch = content.match(new RegExp(`'${section}'\\s*=>\\s*array\\((.*?)\\)`, "s"));
  if (!sectionMatch) {
    return undefined;
  }

  const keyMatch = sectionMatch[1].match(new RegExp(`'${key}'\\s*=>\\s*'([^']*)'`));
  return keyMatch?.[1];
}

function extractNumber(content: string, section: string, key: string): number | undefined {
  const sectionMatch = content.match(new RegExp(`'${section}'\\s*=>\\s*array\\((.*?)\\)`, "s"));
  if (!sectionMatch) {
    return undefined;
  }

  const keyMatch = sectionMatch[1].match(new RegExp(`'${key}'\\s*=>\\s*(\\d+)`));
  return keyMatch ? Number(keyMatch[1]) : undefined;
}

function extractBoolean(content: string, section: string, key: string): boolean | undefined {
  const sectionMatch = content.match(new RegExp(`'${section}'\\s*=>\\s*array\\((.*?)\\)`, "s"));
  if (!sectionMatch) {
    return undefined;
  }

  const keyMatch = sectionMatch[1].match(new RegExp(`'${key}'\\s*=>\\s*(true|false)`));
  if (!keyMatch) {
    return undefined;
  }

  return keyMatch[1] === "true";
}

function buildDatabaseConfig(content: string, section: string): DatabaseConfig | undefined {
  const host = extractString(content, section, "Hostname");
  const user = extractString(content, section, "Username");
  const password = extractString(content, section, "Password");
  const database = extractString(content, section, "Database");
  const port = extractNumber(content, section, "Port") ?? 3306;

  if (!host || !user || password === undefined || !database) {
    return undefined;
  }

  return {
    host,
    port,
    user,
    password,
    database
  };
}

export function loadLegacyServerConfig(rootDir: string): LegacyServerConfig | null {
  const serversPath = path.join(rootDir, "config", "servers.php");
  if (!fs.existsSync(serversPath)) {
    return null;
  }

  const content = fs.readFileSync(serversPath, "utf8");
  const charSectionMatch = content.match(/'CharMapServers'\s*=>\s*array\s*\(\s*array\((.*?)\)\s*\)/s);
  const serverNameMatch = content.match(/'ServerName'\s*=>\s*'([^']+)'/);

  const charDatabase =
    buildDatabaseConfig(content, "DbConfig") ??
    buildDatabaseConfig(content, "WebDbConfig");

  let renewalLoginUseMd5 = extractBoolean(content, "LoginServer", "UseMD5");
  let renewalLoginNoCase = extractBoolean(content, "LoginServer", "NoCase");

  if (charSectionMatch) {
    const charSection = charSectionMatch[1];
    renewalLoginUseMd5 ??=
      (charSection.match(/'UseMD5'\s*=>\s*(true|false)/)?.[1] ?? "") === "true";
    renewalLoginNoCase ??=
      (charSection.match(/'NoCase'\s*=>\s*(true|false)/)?.[1] ?? "") === "true";
  }

  return {
    serverName: serverNameMatch?.[1],
    loginDatabase: buildDatabaseConfig(content, "DbConfig"),
    charDatabase,
    loginUseMd5: renewalLoginUseMd5,
    loginNoCase: renewalLoginNoCase
  };
}
