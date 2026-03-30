import fs from "node:fs";
import path from "node:path";

export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export type RuntimeConfig = {
  port: number;
  sessionSecret: string;
  siteTitle: string;
  serverName: string;
  loginUseMd5: boolean;
  loginNoCase: boolean;
  newsTable: string;
  loginLogTable: string;
  onlinePeakTable: string;
  creditsTable: string;
  usernameAllowedChars: string;
  minUsernameLength: number;
  maxUsernameLength: number;
  minPasswordLength: number;
  maxPasswordLength: number;
  passwordMinUpper: number;
  passwordMinLower: number;
  passwordMinNumber: number;
  passwordMinSymbol: number;
  charRankingLimit: number;
  guildRankingLimit: number;
  loginDatabase: DatabaseConfig;
  charDatabase: DatabaseConfig;
  loginServer: {
    host: string;
    port: number;
  };
  charServer: {
    host: string;
    port: number;
  };
  mapServer: {
    host: string;
    port: number;
  };
};

loadEnvFile();

function loadEnvFile(): void {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function readNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readString(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) {
    return fallback;
  }

  return value === "1" || value === "true" || value === "yes";
}

function createDatabaseConfig(prefix: "FLUX_LOGIN_DB" | "FLUX_CHAR_DB"): DatabaseConfig {
  return {
    host: readString(`${prefix}_HOST`, "127.0.0.1"),
    port: readNumber(`${prefix}_PORT`, 3306),
    user: readString(`${prefix}_USER`, "ragnarok"),
    password: readString(`${prefix}_PASSWORD`, "ragnarok"),
    database: readString(`${prefix}_NAME`, "ragnarok2")
  };
}

export const runtimeConfig: RuntimeConfig = {
  port: readNumber("PORT", 3030),
  sessionSecret: readString("FLUX_SESSION_SECRET", "development-secret"),
  siteTitle: readString("FLUX_SITE_TITLE", "Flux Control Panel"),
  serverName: readString("FLUX_SERVER_NAME", "FluxRO"),
  loginUseMd5: readBoolean("FLUX_LOGIN_USE_MD5", false),
  loginNoCase: readBoolean("FLUX_LOGIN_NO_CASE", true),
  newsTable: readString("FLUX_CMS_NEWS_TABLE", "cp_cmsnews"),
  loginLogTable: readString("FLUX_LOGIN_LOG_TABLE", "cp_loginlog"),
  onlinePeakTable: readString("FLUX_ONLINE_PEAK_TABLE", "cp_onlinepeak"),
  creditsTable: readString("FLUX_CREDITS_TABLE", "cp_credits"),
  usernameAllowedChars: readString("FLUX_USERNAME_ALLOWED_CHARS", "a-zA-Z0-9_"),
  minUsernameLength: readNumber("FLUX_MIN_USERNAME_LENGTH", 4),
  maxUsernameLength: readNumber("FLUX_MAX_USERNAME_LENGTH", 23),
  minPasswordLength: readNumber("FLUX_MIN_PASSWORD_LENGTH", 8),
  maxPasswordLength: readNumber("FLUX_MAX_PASSWORD_LENGTH", 31),
  passwordMinUpper: readNumber("FLUX_PASSWORD_MIN_UPPER", 1),
  passwordMinLower: readNumber("FLUX_PASSWORD_MIN_LOWER", 1),
  passwordMinNumber: readNumber("FLUX_PASSWORD_MIN_NUMBER", 1),
  passwordMinSymbol: readNumber("FLUX_PASSWORD_MIN_SYMBOL", 0),
  charRankingLimit: readNumber("FLUX_CHAR_RANKING_LIMIT", 20),
  guildRankingLimit: readNumber("FLUX_GUILD_RANKING_LIMIT", 20),
  loginDatabase: createDatabaseConfig("FLUX_LOGIN_DB"),
  charDatabase: createDatabaseConfig("FLUX_CHAR_DB"),
  loginServer: {
    host: readString("FLUX_LOGIN_SERVER_HOST", "127.0.0.1"),
    port: readNumber("FLUX_LOGIN_SERVER_PORT", 6900)
  },
  charServer: {
    host: readString("FLUX_CHAR_SERVER_HOST", "127.0.0.1"),
    port: readNumber("FLUX_CHAR_SERVER_PORT", 6121)
  },
  mapServer: {
    host: readString("FLUX_MAP_SERVER_HOST", "127.0.0.1"),
    port: readNumber("FLUX_MAP_SERVER_PORT", 5121)
  }
};
